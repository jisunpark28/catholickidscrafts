import { BIBLE_STICKER_ACCURACY_THRESHOLD } from "@/lib/bible/constants";
import { getReaderKey, type ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";

export { BIBLE_STICKER_ACCURACY_THRESHOLD as GOSPEL_STICKER_ACCURACY_THRESHOLD };

export const GOSPEL_STICKER_SRC = "/images/gospel/praise-sticker.png";

function progressWhere(key: ReaderKey, monthPrefix?: string) {
  const monthFilter = monthPrefix
    ? { dateKey: { startsWith: monthPrefix } }
    : {};

  if (key.type === "guest") {
    return { guestId: key.guestId, ...monthFilter };
  }
  if (key.type === "owner") {
    return { familyAccountId: key.familyAccountId, ...monthFilter };
  }
  return { subProfileId: key.subProfileId, ...monthFilter };
}

export function isSignedInReader(key: ReaderKey | null): key is Exclude<ReaderKey, { type: "guest" }> {
  return Boolean(key && key.type !== "guest");
}

export async function getGospelCompletedDateKeys(
  year: number,
  month: number,
): Promise<string[]> {
  const key = await getReaderKey();
  if (!isSignedInReader(key)) return [];

  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  try {
    const rows = await prisma.gospelDayProgress.findMany({
      where: progressWhere(key, prefix),
      select: { dateKey: true },
      orderBy: { dateKey: "asc" },
    });
    return rows.map((r) => r.dateKey);
  } catch {
    return [];
  }
}

export async function saveGospelDayProgress(
  key: Exclude<ReaderKey, { type: "guest" }>,
  dateKey: string,
  typingAccuracy: number,
): Promise<void> {
  const data = {
    dateKey,
    typingAccuracy,
    completedAt: new Date(),
    guestId: null,
    familyAccountId: key.type === "owner" ? key.familyAccountId : null,
    subProfileId: key.type === "sub" ? key.subProfileId : null,
  };

  if (key.type === "owner") {
    await prisma.gospelDayProgress.upsert({
      where: {
        familyAccountId_dateKey: {
          familyAccountId: key.familyAccountId,
          dateKey,
        },
      },
      create: data,
      update: { typingAccuracy, completedAt: data.completedAt },
    });
    return;
  }

  await prisma.gospelDayProgress.upsert({
    where: {
      subProfileId_dateKey: {
        subProfileId: key.subProfileId,
        dateKey,
      },
    },
    create: data,
    update: { typingAccuracy, completedAt: data.completedAt },
  });
}
