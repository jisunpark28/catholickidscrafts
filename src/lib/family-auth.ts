import {
  familyCookieOptions,
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
    signFamilySession({ familyAccountId, email, sessionVersion }),
    signReaderSession({ type: "owner", familyAccountId, sessionVersion }),
  ]);
  setCookie(res, familyCookieOptions(familyToken));
  setCookie(res, readerCookieOptions(readerToken, "owner"));
  return res;
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

  const familyToken = await signFamilySession({
    familyAccountId: session.familyAccountId,
    email: session.email,
    sessionVersion: session.sessionVersion,
  });
  setCookie(res, familyCookieOptions(familyToken));

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
