import {
  deviceLockCookieOptions,
  DEVICE_LOCK_COOKIE,
  familyCookieOptions,
  signDeviceLock,
  verifyDeviceLock,
  type FamilyReaderMode,
  type FamilySession,
  readerCookieOptions,
  signFamilySession,
  signReaderSession,
  verifyFamilySession,
  FAMILY_SESSION_COOKIE,
  FAMILY_SESSION_REFRESH_AFTER_SEC,
  READER_SESSION_COOKIE,
  verifyReaderSession,
} from "@/lib/family-session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cache } from "react";

const MIN_PASSWORD_LENGTH = 8;

/** Message returned by the retired email+password endpoints. */
export const GOOGLE_ONLY_MESSAGE =
  "Email and password sign-in is no longer available. Please continue with Google using the same email address - your family data stays with your account.";

/**
 * Parent session from the ckc_family cookie, validated against the DB:
 * the account must still exist and the token's sessionVersion must match.
 */
export const getFamilySession = cache(async () => {
  const jar = await cookies();
  const token = jar.get(FAMILY_SESSION_COOKIE)?.value?.trim();
  if (!token) return null;
  const session = await verifyFamilySession(token);
  if (!session) return null;
  const account = await prisma.familyAccount.findUnique({
    where: { id: session.familyAccountId },
    select: { sessionVersion: true },
  });
  if (!account || account.sessionVersion !== session.sessionVersion) return null;
  return session;
});

export async function requireFamilySession() {
  const session = await getFamilySession();
  if (!session) return null;
  const account = await prisma.familyAccount.findUnique({
    where: { id: session.familyAccountId },
    select: { id: true, email: true, displayName: true },
  });
  if (!account) return null;
  return { ...session, displayName: account.displayName };
}

/** The signed "device was handed to a child" marker, if present and valid. */
export async function getDeviceLock() {
  const jar = await cookies();
  return verifyDeviceLock(jar.get(DEVICE_LOCK_COOKIE)?.value?.trim());
}

/**
 * Effective reader mode for a parent session. Fails closed:
 * - an explicit mode in the signed ckc_family token wins;
 * - legacy tokens (no mode) count as child when the device carries a lock marker
 *   or a child ckc_reader, otherwise as the parent.
 */
export async function effectiveReaderMode(session: FamilySession): Promise<FamilyReaderMode> {
  if (session.readerMode) return session.readerMode;
  const lock = await getDeviceLock();
  const jar = await cookies();
  const readerRaw = jar.get(READER_SESSION_COOKIE)?.value?.trim();
  const reader = readerRaw ? await verifyReaderSession(readerRaw) : null;
  if (reader?.type === "sub") return { type: "sub", subProfileId: reader.subProfileId };
  if (lock) return { type: "sub", subProfileId: lock.subProfileId };
  return { type: "owner" };
}

/** True when a parent cookie exists but this device is in child mode. */
export async function isFamilyChildMode(): Promise<boolean> {
  const session = await getFamilySession();
  if (!session) return false;
  return (await effectiveReaderMode(session)).type === "sub";
}

/**
 * Parent-only pages and APIs: a valid parent session that is NOT in child mode.
 * Returns null otherwise (treat like "not signed in as a parent").
 */
export async function requireParentActive() {
  const session = await requireFamilySession();
  if (!session) return null;
  const mode = await effectiveReaderMode(session);
  if (mode.type !== "owner") return null;
  return session;
}

/** API variant of requireParentActive: 401 when signed out, 403 in child mode. */
export async function parentApiGuard(): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof requireFamilySession>>>; error?: undefined }
  | { session?: undefined; error: NextResponse }
> {
  const session = await requireFamilySession();
  if (!session) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  const mode = await effectiveReaderMode(session);
  if (mode.type !== "owner") {
    return {
      error: NextResponse.json(
        { error: "Grown-ups only: sign out and sign in with Google again to return to the parent account." },
        { status: 403 },
      ),
    };
  }
  return { session };
}

export async function getFamilySessionVersion(familyAccountId: string): Promise<number> {
  const account = await prisma.familyAccount.findUnique({
    where: { id: familyAccountId },
    select: { sessionVersion: true },
  });
  return account?.sessionVersion ?? 0;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export async function hashFamilyPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyFamilyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function setCookie(res: NextResponse, opts: ReturnType<typeof familyCookieOptions>) {
  res.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
}

export async function setFamilyAndOwnerReaderCookies(
  res: NextResponse,
  familyAccountId: string,
  email: string,
) {
  const sessionVersion = await getFamilySessionVersion(familyAccountId);
  const [familyToken, readerToken] = await Promise.all([
    signFamilySession({ familyAccountId, email, sessionVersion, readerMode: { type: "owner" } }),
    signReaderSession({ type: "owner", familyAccountId, sessionVersion }),
  ]);
  setCookie(res, familyCookieOptions(familyToken));
  setCookie(res, readerCookieOptions(readerToken, "owner"));
  return res;
}

/**
 * Parent cookie in child mode (used when a Google sign-in on a locked device could not
 * prove a fresh login). The child's reader cookie is only set when that profile is known.
 */
export async function setFamilyChildModeCookies(
  res: NextResponse,
  familyAccountId: string,
  email: string,
  subProfileId: string | null,
) {
  const sessionVersion = await getFamilySessionVersion(familyAccountId);
  const familyToken = await signFamilySession({
    familyAccountId,
    email,
    sessionVersion,
    readerMode: { type: "sub", subProfileId },
  });
  setCookie(res, familyCookieOptions(familyToken));
  if (subProfileId) {
    const readerToken = await signReaderSession({
      type: "sub",
      subProfileId,
      familyAccountId,
      sessionVersion,
    });
    setCookie(res, readerCookieOptions(readerToken, "sub"));
  } else {
    res.cookies.set(READER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}

/** Auth.js (admin) session cookie names, including chunked and __Secure- variants. */
const ADMIN_SESSION_COOKIE_RE = /^(__Secure-)?(authjs|next-auth)\.session-token(\.\d+)?$/;

/** Sign out any admin session on this browser (used when the device enters child mode). */
export async function clearAdminSessionCookies(res: NextResponse): Promise<void> {
  const jar = await cookies();
  for (const c of jar.getAll()) {
    if (!ADMIN_SESSION_COOKIE_RE.test(c.name)) continue;
    res.cookies.set(c.name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: c.name.startsWith("__Secure-") || process.env.NODE_ENV === "production",
    });
  }
}

/**
 * Parent -> child (instant): mark this device as locked, switch the signed parent cookie
 * to child mode, and sign out any admin session in this browser.
 */
export async function enterChildMode(
  res: NextResponse,
  child: { subProfileId: string; familyAccountId: string },
): Promise<void> {
  const lockToken = await signDeviceLock(child);
  setCookie(res, deviceLockCookieOptions(lockToken));

  const family = await getFamilySession();
  if (family) {
    const familyToken = await signFamilySession({
      familyAccountId: family.familyAccountId,
      email: family.email,
      sessionVersion: family.sessionVersion,
      readerMode: {
        type: "sub",
        subProfileId: family.familyAccountId === child.familyAccountId ? child.subProfileId : null,
      },
    });
    setCookie(res, familyCookieOptions(familyToken));
  }
  await clearAdminSessionCookies(res);
}

/** A verified fresh parent sign-in unlocks the device. */
export function clearDeviceLock(res: NextResponse) {
  res.cookies.set(DEVICE_LOCK_COOKIE, "", { path: "/", maxAge: 0 });
}

export function clearFamilyCookies(res: NextResponse) {
  res.cookies.set(FAMILY_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(READER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Restore reader cookie when parent is signed in but reader cookie was missing. */
export async function ensureOwnerReaderCookie(
  res: NextResponse,
  familyAccountId: string,
): Promise<void> {
  const jar = await cookies();
  if (jar.get(READER_SESSION_COOKIE)?.value?.trim()) return;
  // Never mint an owner reader for a device in child mode (or a legacy token we cannot vouch for).
  const family = await getFamilySession();
  if (!family || family.familyAccountId !== familyAccountId || family.readerMode?.type !== "owner") return;

  const sessionVersion = await getFamilySessionVersion(familyAccountId);
  const token = await signReaderSession({ type: "owner", familyAccountId, sessionVersion });
  setCookie(res, readerCookieOptions(token, "owner"));
}

/**
 * Rolling 30-day parent session: re-issue ckc_family (and an owner ckc_reader)
 * once the current token is more than a day old. Call from a frequently-hit route.
 */
export async function refreshFamilySessionIfStale(res: NextResponse): Promise<void> {
  const session = await getFamilySession();
  if (!session) return;
  if (Date.now() / 1000 - session.issuedAt < FAMILY_SESSION_REFRESH_AFTER_SEC) return;

  const readerMode = await effectiveReaderMode(session);
  const familyToken = await signFamilySession({
    familyAccountId: session.familyAccountId,
    email: session.email,
    sessionVersion: session.sessionVersion,
    readerMode,
  });
  setCookie(res, familyCookieOptions(familyToken));
  if (readerMode.type !== "owner") return;

  const jar = await cookies();
  const readerRaw = jar.get(READER_SESSION_COOKIE)?.value?.trim();
  const reader = readerRaw ? await verifyReaderSession(readerRaw) : null;
  if (reader?.type === "owner" && reader.familyAccountId === session.familyAccountId) {
    const readerToken = await signReaderSession({
      type: "owner",
      familyAccountId: session.familyAccountId,
      sessionVersion: session.sessionVersion,
    });
    setCookie(res, readerCookieOptions(readerToken, "owner"));
  }
}
