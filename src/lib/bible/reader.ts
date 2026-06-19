import { randomUUID } from "crypto";
import { cookies } from "next/headers";

/** Anonymous browser reader until family / Access ID login (Phase D). */
export const BIBLE_READER_COOKIE = "ckc_bible_reader";

const ONE_YEAR = 60 * 60 * 24 * 365;

export type ReaderKey =
  | { type: "guest"; guestId: string }
  | { type: "owner"; familyAccountId: string }
  | { type: "sub"; subProfileId: string };

/** Resolve the active reader from cookies (guest today; owner/sub in Phase D). */
export async function getReaderKey(): Promise<ReaderKey | null> {
  const jar = await cookies();
  const guestId = jar.get(BIBLE_READER_COOKIE)?.value?.trim();
  if (guestId) return { type: "guest", guestId };
  return null;
}

export function readerCookieOptions(guestId: string) {
  return {
    name: BIBLE_READER_COOKIE,
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
