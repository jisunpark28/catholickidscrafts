import { clearDeviceLockCookie } from "@/lib/child-mode-cookies";
import { clientIpFromHeaders } from "@/lib/client-ip";
import {
  checkUnlockCode,
  DEVICE_UNLOCK_COOKIE,
  DEVICE_UNLOCK_MAX_TRIES,
  deviceUnlockCookieOptions,
  isUnlockCodeFormat,
} from "@/lib/device-unlock";
import { consumeUnlockChallenge, isCurrentUnlockChallenge } from "@/lib/device-unlock-store";
import { getDeviceLock, getFamilySession, setFamilyAndOwnerReaderCookies } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import {
  clearRateLimit,
  getRateLimitState,
  recordRateLimitFailure,
  type RateLimitRule,
} from "@/lib/rate-limit";
import { crossOriginError } from "@/lib/same-origin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Wrong codes per challenge: 5, then that challenge is dead. */
const TRY_RULE: RateLimitRule = { max: DEVICE_UNLOCK_MAX_TRIES, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };
/** Wrong codes per IP: 15 in 15 minutes, then 1 hour blocked. */
const IP_RULE: RateLimitRule = { max: 15, windowMs: 15 * 60 * 1000, blockMs: 60 * 60 * 1000 };
/** Marks a challenge as used (single use). */
const USED_RULE: RateLimitRule = { max: 1, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

const noStore = { "Cache-Control": "private, no-store" };

function clearChallenge(res: NextResponse) {
  const c = deviceUnlockCookieOptions("", 0);
  res.cookies.set(c.name, "", c);
}

/** Check the emailed code; on success the device leaves child mode and the parent is signed in. */
export async function POST(request: Request) {
  const originError = crossOriginError(request);
  if (originError) return originError;

  let body: { code?: unknown } = {};
  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    /* empty body */
  }
  const code = typeof body.code === "string" ? body.code.replace(/\s+/g, "") : "";
  if (!isUnlockCodeFormat(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400, headers: noStore });
  }

  const lock = await getDeviceLock();
  if (!lock) {
    return NextResponse.json({ error: "This device is not in child mode." }, { status: 400, headers: noStore });
  }
  const family = await getFamilySession();
  const familyAccountId = lock.familyAccountId ?? family?.familyAccountId ?? null;
  if (!familyAccountId) {
    return NextResponse.json({ error: "Ask for a new code." }, { status: 400, headers: noStore });
  }

  const ipKey = `unlock-verify:ip:${clientIpFromHeaders(request.headers)}`;
  const jar = await cookies();
  const token = jar.get(DEVICE_UNLOCK_COOKIE)?.value ?? null;
  const result = await checkUnlockCode(token, code, { familyAccountId, lockedAt: lock.lockedAt });

  const keys = result.nonce ? [ipKey, `unlock-try:${result.nonce}`, `unlock-used:${result.nonce}`] : [ipKey];
  const limit = await getRateLimitState(keys);
  if (limit.blocked) {
    const res = NextResponse.json(
      { error: "This code can no longer be used. Ask for a new code." },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec) } },
    );
    clearChallenge(res);
    return res;
  }

  // Only the newest, unused code of this family counts (a newer code or a used one voids it).
  if (result.nonce && !(await isCurrentUnlockChallenge(familyAccountId, result.nonce))) {
    const res = NextResponse.json(
      { error: "This code is no longer valid. Use the newest code we emailed, or ask for a new one." },
      { status: 400, headers: noStore },
    );
    clearChallenge(res);
    return res;
  }

  if (!result.ok) {
    if (result.reason !== "wrong_code") {
      const res = NextResponse.json({ error: "This code expired. Ask for a new code." }, { status: 400, headers: noStore });
      clearChallenge(res);
      return res;
    }
    await recordRateLimitFailure(ipKey, IP_RULE);
    const tries = await recordRateLimitFailure(`unlock-try:${result.nonce}`, TRY_RULE);
    const res = NextResponse.json(
      { error: tries.blocked ? "Too many wrong codes. Ask for a new code." : "That code is not right. Check the email and try again." },
      { status: 400, headers: noStore },
    );
    if (tries.blocked) clearChallenge(res);
    return res;
  }

  // Single use (atomic: two parallel requests cannot both pass), then sign the grown-up in.
  await recordRateLimitFailure(`unlock-used:${result.nonce}`, USED_RULE);
  if (!(await consumeUnlockChallenge(result.familyAccountId, result.nonce))) {
    const res = NextResponse.json(
      { error: "This code is no longer valid. Ask for a new code." },
      { status: 400, headers: noStore },
    );
    clearChallenge(res);
    return res;
  }
  const account = await prisma.familyAccount.findUnique({
    where: { id: result.familyAccountId },
    select: { id: true, email: true },
  });
  if (!account) {
    const res = NextResponse.json({ error: "This family account no longer exists." }, { status: 400, headers: noStore });
    clearChallenge(res);
    return res;
  }

  const res = NextResponse.json({ ok: true, redirect: "/account" }, { headers: noStore });
  await setFamilyAndOwnerReaderCookies(res, account.id, account.email);
  clearDeviceLockCookie(res);
  clearChallenge(res);
  await clearRateLimit([`unlock-try:${result.nonce}`]);
  return res;
}
