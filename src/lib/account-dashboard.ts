import type { BibleBookMeta } from "@/lib/bible/latinprayer";
import { fetchBibleBooks } from "@/lib/bible/latinprayer";
import { prisma } from "@/lib/prisma";

export type StickerCategoryKey = "bible" | "ot" | "nt" | "gospel";

export type StickerCategory = {
  key: StickerCategoryKey;
  label: string;
  completed: number;
  total: number;
};

export type DashboardReaderRow = {
  id: string | null;
  kind: "owner" | "sub";
  displayName: string;
  accountLabel: string;
  active: boolean;
  totalStickers: number;
  categories: StickerCategory[];
};

type ReaderScope =
  | { kind: "owner"; familyAccountId: string }
  | { kind: "sub"; familyAccountId: string; subProfileId: string };

function daysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

function bibleTotals(books: BibleBookMeta[]) {
  const otBooks = books.filter((b) => b.testament === "OT");
  const ntBooks = books.filter((b) => b.testament === "NT");
  return {
    all: books.reduce((sum, b) => sum + b.totalChapters, 0),
    ot: otBooks.reduce((sum, b) => sum + b.totalChapters, 0),
    nt: ntBooks.reduce((sum, b) => sum + b.totalChapters, 0),
    otSlugs: new Set(otBooks.map((b) => b.slug)),
    ntSlugs: new Set(ntBooks.map((b) => b.slug)),
  };
}

async function stickerStatsForScope(
  scope: ReaderScope,
  books: BibleBookMeta[],
): Promise<Pick<DashboardReaderRow, "totalStickers" | "categories">> {
  const totals = bibleTotals(books);
  const year = new Date().getFullYear();

  const bibleWhere =
    scope.kind === "owner"
      ? { familyAccountId: scope.familyAccountId }
      : { subProfileId: scope.subProfileId };

  const gospelWhere =
    scope.kind === "owner"
      ? {
          familyAccountId: scope.familyAccountId,
          dateKey: { startsWith: `${year}-` },
        }
      : {
          subProfileId: scope.subProfileId,
          dateKey: { startsWith: `${year}-` },
        };

  const [bibleRows, gospelCount] = await Promise.all([
    prisma.bibleChapterProgress.findMany({
      where: bibleWhere,
      select: { bookSlug: true },
    }),
    prisma.gospelDayProgress.count({ where: gospelWhere }),
  ]);

  let otCompleted = 0;
  let ntCompleted = 0;
  for (const row of bibleRows) {
    if (totals.otSlugs.has(row.bookSlug)) otCompleted += 1;
    if (totals.ntSlugs.has(row.bookSlug)) ntCompleted += 1;
  }

  const bibleCompleted = bibleRows.length;
  const totalStickers = bibleCompleted + gospelCount;

  return {
    totalStickers,
    categories: [
      {
        key: "bible",
        label: "Bible",
        completed: bibleCompleted,
        total: totals.all,
      },
      {
        key: "ot",
        label: "Old Testament",
        completed: otCompleted,
        total: totals.ot,
      },
      {
        key: "nt",
        label: "New Testament",
        completed: ntCompleted,
        total: totals.nt,
      },
      {
        key: "gospel",
        label: "Gospel",
        completed: gospelCount,
        total: daysInYear(year),
      },
    ],
  };
}

export async function loadAccountDashboardReaders(familyAccountId: string): Promise<{
  owner: DashboardReaderRow;
  subs: DashboardReaderRow[];
}> {
  const [account, subs, books] = await Promise.all([
    prisma.familyAccount.findUniqueOrThrow({
      where: { id: familyAccountId },
      select: { id: true, email: true, displayName: true },
    }),
    prisma.subProfile.findMany({
      where: { familyAccountId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        displayName: true,
        accessCodeLast4: true,
        active: true,
      },
    }),
    fetchBibleBooks(),
  ]);

  const ownerName =
    account.displayName?.trim() || account.email.split("@")[0] || account.email;

  const ownerStats = await stickerStatsForScope(
    { kind: "owner", familyAccountId },
    books,
  );

  const owner: DashboardReaderRow = {
    id: null,
    kind: "owner",
    displayName: ownerName,
    accountLabel: "Main",
    active: true,
    ...ownerStats,
  };

  const subRows = await Promise.all(
    subs.map(async (sub) => {
      const stats = await stickerStatsForScope(
        { kind: "sub", familyAccountId, subProfileId: sub.id },
        books,
      );
      return {
        id: sub.id,
        kind: "sub" as const,
        displayName: sub.displayName,
        accountLabel: sub.accessCodeLast4 ? `…${sub.accessCodeLast4}` : "Access ID",
        active: sub.active,
        ...stats,
      };
    }),
  );

  return { owner, subs: subRows };
}
