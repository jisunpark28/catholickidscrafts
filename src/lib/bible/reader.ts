import { verifyReaderSession, READER_SESSION_COOKIE, type ReaderSession } from "@/lib/family-session";
import { getFamilySession } from "@/lib/family-auth";
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

  const readerToken = jar.get(READER_SESSION_COOKIE)?.value?.trim();
  if (readerToken) {
    const session = await verifyReaderSession(readerToken);
    if (session && (await isReaderSessionCurrent(session))) {
      if (session.type === "owner") {
        return { type: "owner", familyAccountId: session.familyAccountId };
      }
      return { type: "sub", subProfileId: session.subProfileId };
    }
  }

  const family = await getFamilySession();
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
