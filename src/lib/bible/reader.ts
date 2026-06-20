import { verifyReaderSession, READER_SESSION_COOKIE } from "@/lib/family-session";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

/** Anonymous browser progress before signing in. */
export const BIBLE_GUEST_COOKIE = "ckc_bible_reader";

const ONE_YEAR = 60 * 60 * 24 * 365;

export type ReaderKey =
  | { type: "guest"; guestId: string }
  | { type: "owner"; familyAccountId: string }
  | { type: "sub"; subProfileId: string };

/** Active reader for Bible progress: signed session first, then guest cookie. */
export async function getReaderKey(): Promise<ReaderKey | null> {
  const jar = await cookies();

  const readerToken = jar.get(READER_SESSION_COOKIE)?.value?.trim();
  if (readerToken) {
    const session = await verifyReaderSession(readerToken);
    if (session?.type === "owner") {
      return { type: "owner", familyAccountId: session.familyAccountId };
    }
    if (session?.type === "sub") {
      return { type: "sub", subProfileId: session.subProfileId };
    }
  }

  const guestId = jar.get(BIBLE_GUEST_COOKIE)?.value?.trim();
  if (guestId) return { type: "guest", guestId };

  return null;
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
