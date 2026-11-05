import { clientIpFromHeaders } from "@/lib/client-ip";
import {
  createUnlockChallenge,
  DEVICE_UNLOCK_TTL_SEC,
  deviceUnlockCookieOptions,
  maskEmail,
} from "@/lib/device-unlock";
import { complianceFooter, emailConfigured, escapeHtml, sendEmail } from "@/lib/email";
import { getDeviceLock, getFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { getRateLimitState, recordRateLimitFailure, type RateLimitRule } from "@/lib/rate-limit";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Codes sent per family account: 3 an hour. */
const SEND_ACCOUNT_RULE: RateLimitRule = { max: 3, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };
/** Codes sent per IP: 10 an hour. */
const SEND_IP_RULE: RateLimitRule = { max: 10, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Child-mode device: email a one-time code to the grown-up account so a parent can leave
 * child mode without Google asking for a password. Only works on a locked device and only
 * for the family the device was locked to.
 */
export async function POST(request: Request) {
  const originError = crossOriginError(request);
  if (originError) return originError;

  const lock = await getDeviceLock();
  if (!lock) {
    return NextResponse.json({ error: "This device is not in child mode." }, { status: 400, headers: noStore });
  }
  const family = await getFamilySession();
  const familyAccountId = lock.familyAccountId ?? family?.familyAccountId ?? null;
  if (!familyAccountId) {
    return NextResponse.json(
      { error: "We could not tell which family this device belongs to. Sign in with Google instead." },
      { status: 400, headers: noStore },
    );
  }

  const accountKey = `unlock-send:acct:${familyAccountId}`;
  const ipKey = `unlock-send:ip:${clientIpFromHeaders(request.headers)}`;
  const limit = await getRateLimitState([accountKey, ipKey]);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Too many codes were sent. Please try again later." },
      { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const account = await prisma.familyAccount.findUnique({
    where: { id: familyAccountId },
    select: { id: true, email: true },
  });
  if (!account) {
    return NextResponse.json({ error: "This family account no longer exists." }, { status: 400, headers: noStore });
  }
  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "Email codes are not available right now. Sign in with Google instead." },
      { status: 503, headers: noStore },
    );
  }

  const { code, token } = await createUnlockChallenge({ familyAccountId: account.id, lockedAt: lock.lockedAt });
  const minutes = Math.round(DEVICE_UNLOCK_TTL_SEC / 60);
  const what = `Someone asked to switch a device that is in child mode back to your grown-up account (${account.email}).`;
  const footer = complianceFooter(
    null,
    "You are receiving this account security notice because a sign-in code was requested for your family account.",
  );
  const sent = await sendEmail({
    to: account.email,
    subject: `Your code to leave child mode: ${code}`,
    text: `${what}\n\nCode: ${code}\nIt works once and expires in ${minutes} minutes.\n\nType it in yourself. If you did not ask for it, ignore this email: the device stays in child mode.${footer.text}`,
    html: `<p>${escapeHtml(what)}</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It works once and expires in ${minutes} minutes.</p><p>Type it in yourself. If you did not ask for it, ignore this email: the device stays in child mode.</p>${footer.html}`,
  });
  if (!sent) {
    return NextResponse.json({ error: "We could not send the email. Please try again." }, { status: 502, headers: noStore });
  }
  await Promise.all([
    recordRateLimitFailure(accountKey, SEND_ACCOUNT_RULE),
    recordRateLimitFailure(ipKey, SEND_IP_RULE),
  ]);

  const res = NextResponse.json({ ok: true, sentTo: maskEmail(account.email) }, { headers: noStore });
  const c = deviceUnlockCookieOptions(token);
  res.cookies.set(c.name, c.value, c);
  return res;
}
