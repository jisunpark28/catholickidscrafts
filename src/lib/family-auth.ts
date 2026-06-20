import {
  familyCookieOptions,
  readerCookieOptions,
  signFamilySession,
  signReaderSession,
  verifyFamilySession,
  FAMILY_SESSION_COOKIE,
  READER_SESSION_COOKIE,
} from "@/lib/family-session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const MIN_PASSWORD_LENGTH = 8;

export async function getFamilySession() {
  const jar = await cookies();
  const token = jar.get(FAMILY_SESSION_COOKIE)?.value?.trim();
  if (!token) return null;
  return verifyFamilySession(token);
}

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

export function setFamilyAndOwnerReaderCookies(
  res: NextResponse,
  familyAccountId: string,
  email: string,
) {
  return Promise.all([
    signFamilySession({ familyAccountId, email }),
    signReaderSession({ type: "owner", familyAccountId }),
  ]).then(([familyToken, readerToken]) => {
    const familyOpts = familyCookieOptions(familyToken);
    const readerOpts = readerCookieOptions(readerToken);
    res.cookies.set(familyOpts.name, familyOpts.value, {
      httpOnly: familyOpts.httpOnly,
      sameSite: familyOpts.sameSite,
      secure: familyOpts.secure,
      path: familyOpts.path,
      maxAge: familyOpts.maxAge,
    });
    res.cookies.set(readerOpts.name, readerOpts.value, {
      httpOnly: readerOpts.httpOnly,
      sameSite: readerOpts.sameSite,
      secure: readerOpts.secure,
      path: readerOpts.path,
      maxAge: readerOpts.maxAge,
    });
    return res;
  });
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

  const token = await signReaderSession({ type: "owner", familyAccountId });
  const readerOpts = readerCookieOptions(token);
  res.cookies.set(readerOpts.name, readerOpts.value, {
    httpOnly: readerOpts.httpOnly,
    sameSite: readerOpts.sameSite,
    secure: readerOpts.secure,
    path: readerOpts.path,
    maxAge: readerOpts.maxAge,
  });
}
