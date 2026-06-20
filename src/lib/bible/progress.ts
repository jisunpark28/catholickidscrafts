import { prisma } from "@/lib/prisma";
import {
  BIBLE_GUEST_COOKIE,
  getGuestIdFromCookies,
  getReaderKey,
  type ReaderKey,
} from "@/lib/bible/reader";
import type { NextResponse } from "next/server";

function progressWhere(key: ReaderKey, bookSlug?: string) {
  if (key.type === "guest") {
    return {
      guestId: key.guestId,
      ...(bookSlug ? { bookSlug } : {}),
    };
  }
  if (key.type === "owner") {
    return {
      familyAccountId: key.familyAccountId,
      ...(bookSlug ? { bookSlug } : {}),
    };
  }
  return {
    subProfileId: key.subProfileId,
    ...(bookSlug ? { bookSlug } : {}),
  };
}

export async function getCompletedChaptersForBook(
  bookSlug: string,
): Promise<number[]> {
  const key = await getReaderKey();
  if (!key) return [];

  try {
    const rows = await prisma.bibleChapterProgress.findMany({
      where: progressWhere(key, bookSlug),
      select: { chapter: true },
      orderBy: { chapter: "asc" },
    });
    return rows.map((r) => r.chapter);
  } catch {
    return [];
  }
}

export async function saveChapterProgress(
  key: ReaderKey,
  bookSlug: string,
  chapter: number,
  typingAccuracy: number,
): Promise<void> {
  const data = {
    bookSlug,
    chapter,
    typingAccuracy,
    completedAt: new Date(),
    guestId: key.type === "guest" ? key.guestId : null,
    familyAccountId: key.type === "owner" ? key.familyAccountId : null,
    subProfileId: key.type === "sub" ? key.subProfileId : null,
  };

  if (key.type === "guest") {
    await prisma.bibleChapterProgress.upsert({
      where: {
        guestId_bookSlug_chapter: {
          guestId: key.guestId,
          bookSlug,
          chapter,
        },
      },
      create: data,
      update: { typingAccuracy, completedAt: data.completedAt },
    });
    return;
  }

  if (key.type === "owner") {
    await prisma.bibleChapterProgress.upsert({
      where: {
        familyAccountId_bookSlug_chapter: {
          familyAccountId: key.familyAccountId,
          bookSlug,
          chapter,
        },
      },
      create: data,
      update: { typingAccuracy, completedAt: data.completedAt },
    });
    return;
  }

  await prisma.bibleChapterProgress.upsert({
    where: {
      subProfileId_bookSlug_chapter: {
        subProfileId: key.subProfileId,
        bookSlug,
        chapter,
      },
    },
    create: data,
    update: { typingAccuracy, completedAt: data.completedAt },
  });
}

/** Move anonymous guest stickers onto a signed-in reader (best-effort merge). */
export async function mergeGuestProgressIntoReader(
  guestId: string,
  key: Exclude<ReaderKey, { type: "guest" }>,
): Promise<void> {
  const guestRows = await prisma.bibleChapterProgress.findMany({
    where: { guestId },
  });
  if (guestRows.length === 0) return;

  for (const row of guestRows) {
    await saveChapterProgress(
      key,
      row.bookSlug,
      row.chapter,
      row.typingAccuracy ?? 0.9,
    );
  }

  await prisma.bibleChapterProgress.deleteMany({ where: { guestId } });
}

/** Merge anonymous guest stickers when the active reader is signed in. */
export async function attachGuestProgressIfAny(
  key: Exclude<ReaderKey, { type: "guest" }>,
): Promise<boolean> {
  const guestId = await getGuestIdFromCookies();
  if (!guestId) return false;
  await mergeGuestProgressIntoReader(guestId, key);
  return true;
}

export function clearGuestProgressCookie(res: NextResponse) {
  res.cookies.set(BIBLE_GUEST_COOKIE, "", { path: "/", maxAge: 0 });
}

