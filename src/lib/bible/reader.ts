import { verifyReaderSession, READER_SESSION_COOKIE, type ReaderSession } from "@/lib/family-session";
import { effectiveReaderMode, getDeviceLock, getFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";

/** Anonymous browser progress before signing in. */
export const BIBLE_GUEST_COOKIE = "ckc_bible_reader";

const ONE_YEAR = 60 * 60 * 24 * 365;

export type ReaderKey =
  | { type: "guest"; guestId: string }
  | { type: "owner"; familyAccountId: string }
  | { type: "sub"; subProfileId: string };

/**
 * Check a reader token against the DB so revocation is immediate:
 * - the family account must exist and its sessionVersion must match;
 * - a child profile must still exist, be active, and belong to that family.
 */
async function isReaderSessionCurrent(session: ReaderSession): Promise<boolean> {
  if (session.type === "owner") {
    const account = await prisma.familyAccount.findUnique({
      where: { id: session.familyAccountId },
      select: { sessionVersion: true },
    });
    return Boolean(account && account.sessionVersion === session.sessionVersion);
  }
  const sub = await prisma.subProfile.findUnique({
    where: { id: session.subProfileId },
    select: {
      active: true,
      familyAccountId: true,
      familyAccount: { select: { sessionVersion: true } },
    },
  });
  return Boolean(
    sub &&
      sub.active &&
      sub.familyAccountId === session.familyAccountId &&
      sub.familyAccount.sessionVersion === session.sessionVersion,
  );
}

/** Active reader for Bible progress: reader session, then parent family sign-in, then guest. */
export const getReaderKey = cache(async (): Promise<ReaderKey | null> => {
  const jar = await cookies();
  const family = await getFamilySession();
  const familyMode = family ? await effectiveReaderMode(family) : null;

  const readerToken = jar.get(READER_SESSION_COOKIE)?.value?.trim();
  const readerSession = readerToken ? await verifyReaderSession(readerToken) : null;
  const reader =
    readerSession && (await isReaderSessionCurrent(readerSession)) ? readerSession : null;

  // Child mode is decided by the signed parent cookie, never by ckc_reader alone:
  // a missing or edited reader cookie keeps the device on the child (or on no reader).
  if (family && familyMode?.type === "sub") {
    const subId =
      familyMode.subProfileId ??
      (reader?.type === "sub" && reader.familyAccountId === family.familyAccountId
        ? reader.subProfileId
        : null);
    if (subId) {
      const sub = await prisma.subProfile.findUnique({
        where: { id: subId },
        select: { active: true, familyAccountId: true },
      });
      if (sub?.active && sub.familyAccountId === family.familyAccountId) {
        return { type: "sub", subProfileId: subId };
      }
    }
    return null;
  }

  if (reader) {
    if (reader.type === "sub") return { type: "sub", subProfileId: reader.subProfileId };
    // An owner reader token alone is not enough on a locked device without a parent session.
    if (family || !(await getDeviceLock())) {
      return { type: "owner", familyAccountId: reader.familyAccountId };
    }
  }

  if (family) {
    return { type: "owner", familyAccountId: family.familyAccountId };
  }

  const guestId = jar.get(BIBLE_GUEST_COOKIE)?.value?.trim();
  if (guestId) return { type: "guest", guestId };

  return null;
});

export function isSignedInReaderKey(
  key: ReaderKey | null,
): key is Exclude<ReaderKey, { type: "guest" }> {
  return Boolean(key && key.type !== "guest");
}

export function guestCookieOptions(guestId: string) {
  return {
    name: BIBLE_GUEST_COOKIE,
    value: guestId,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  };
}

export function newGuestId(): string {
  return randomUUID();
}

export async function getGuestIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(BIBLE_GUEST_COOKIE)?.value?.trim() ?? null;
}
