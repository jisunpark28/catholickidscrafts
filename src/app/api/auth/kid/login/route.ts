import { BIBLE_GUEST_COOKIE, getGuestIdFromCookies } from "@/lib/bible/reader";
import { mergeGuestProgressIntoReader } from "@/lib/bible/progress";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { enterChildMode } from "@/lib/family-auth";
import { readerCookieOptions, signReaderSession } from "@/lib/family-session";
import { isValidKidCode, normalizeKidCode } from "@/lib/kids/kid-code";
import { kidProfileName } from "@/lib/kids/kid-device-profiles";
import { KID_LOGIN_GENERIC_ERROR, KID_LOGIN_TOO_MANY } from "@/lib/kids/kid-login-copy";
import { pinFailureOutcome, pinLoginBlock, verifyKidPin } from "@/lib/kids/kid-pin";
import { sendKidPinAlert } from "@/lib/moms-bible/pin-lockout-email";
import { prisma } from "@/lib/prisma";
import { getRateLimitState, KID_PIN_IP_RULE, recordRateLimitFailure } from "@/lib/rate-limit";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function tooManyAttempts(retryAfterSec: number) {
  return NextResponse.json(
    { error: KID_LOGIN_TOO_MANY },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

/** Same answer for unknown code, paused child, no PIN yet, locked, disabled and wrong PIN. */
async function failed(rateKey: string) {
  const state = await recordRateLimitFailure(rateKey, KID_PIN_IP_RULE);
  if (state.blocked) return tooManyAttempts(state.retryAfterSec);
  return NextResponse.json({ error: KID_LOGIN_GENERIC_ERROR }, { status: 401 });
}

/** Kid Code + 4-digit PIN sign-in (Mom's Bible PR-2). Replaces the Access ID sign-in. */
export async function POST(request: Request) {
  const originError = crossOriginError(request);
  if (originError) return originError;

  const rateKey = `kidpin:ip:${clientIpFromHeaders(request.headers)}`;
  const limit = await getRateLimitState([rateKey]);
  if (limit.blocked) return tooManyAttempts(limit.retryAfterSec);

  let body: { code?: unknown; pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const code = normalizeKidCode(typeof body.code === "string" ? body.code.slice(0, 40) : "");
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  const sub = isValidKidCode(code)
    ? await prisma.subProfile.findUnique({
        where: { kidCode: code },
        select: {
          id: true,
          displayName: true,
          kidCode: true,
          active: true,
          familyAccountId: true,
          pinHash: true,
          pinFailCount: true,
          pinLockedUntil: true,
          pinDisabledAt: true,
          familyAccount: { select: { sessionVersion: true } },
        },
      })
    : null;

  const now = new Date();
  const block = sub ? pinLoginBlock(sub, now) : "no-pin";
  const canTry = Boolean(sub?.active) && block === null;

  // Always exactly one bcrypt compare, so timing doesn't reveal whether the code exists.
  const ok = await verifyKidPin(sub?.id ?? null, pin, canTry ? sub!.pinHash : null);

  if (!sub || !canTry) return failed(rateKey);

  if (!ok) {
    // Atomic increment so parallel guesses can't skip a lockout step.
    const updated = await prisma.subProfile.update({
      where: { id: sub.id },
      data: { pinFailCount: { increment: 1 } },
      select: { pinFailCount: true },
    });
    const outcome = pinFailureOutcome(updated.pinFailCount, now);
    if (outcome.lockedUntil || outcome.disabled) {
      await prisma.subProfile.update({
        where: { id: sub.id },
        data: outcome.disabled
          ? { pinDisabledAt: now, pinLockedUntil: null }
          : { pinLockedUntil: outcome.lockedUntil },
      });
    }
    if (outcome.alert) {
      await sendKidPinAlert(sub.id, outcome.alert).catch((e) => console.error("kid pin alert", e));
    }
    return failed(rateKey);
  }

  // Success: reset this child's counter. The IP counter is NOT cleared, so one known
  // PIN can't be used to reset the limit while guessing other children's PINs.
  if (sub.pinFailCount !== 0 || sub.pinLockedUntil) {
    await prisma.subProfile.update({
      where: { id: sub.id },
      data: { pinFailCount: 0, pinLockedUntil: null },
    });
  }

  const guestId = (await getGuestIdFromCookies()) ?? null;
  if (guestId) {
    await mergeGuestProgressIntoReader(guestId, {
      type: "sub",
      subProfileId: sub.id,
    }).catch((e) => console.error("merge guest on kid login", e));
  }

  const readerToken = await signReaderSession({
    type: "sub",
    subProfileId: sub.id,
    familyAccountId: sub.familyAccountId,
    sessionVersion: sub.familyAccount.sessionVersion,
  });

  const res = NextResponse.json({
    ok: true,
    // Only what the device picker stores: Kid Code + first name.
    profile: { code: sub.kidCode, name: kidProfileName(sub.displayName) },
  });
  const opts = readerCookieOptions(readerToken, "sub");
  res.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  if (guestId) {
    res.cookies.set(BIBLE_GUEST_COOKIE, "", { path: "/", maxAge: 0 });
  }
  // Same as the old Access ID sign-in: lock the device to child mode, sign out any admin session.
  await enterChildMode(res, { subProfileId: sub.id, familyAccountId: sub.familyAccountId });
  return res;
}
