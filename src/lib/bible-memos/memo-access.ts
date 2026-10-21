import {
  isMemoColor,
  DEFAULT_MEMO_COLOR,
  type PassageMemoDto,
} from "@/lib/bible-memos/passage-memos";
import type { ReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type SignedInKey = Exclude<ReaderKey, { type: "guest" }>;

export type MemoViewer = {
  key: SignedInKey;
  familyAccountId: string;
  /** null for the parent (family owner). */
  subProfileId: string | null;
  isParent: boolean;
  name: string;
  parentName: string;
};

const PARENT_FALLBACK = "Parent";

/** Resolve the signed-in reader's family and display names. */
export async function resolveMemoViewer(key: SignedInKey): Promise<MemoViewer | null> {
  if (key.type === "owner") {
    const fam = await prisma.familyAccount.findUnique({
      where: { id: key.familyAccountId },
      select: { displayName: true },
    });
    if (!fam) return null;
    const parentName = fam.displayName?.trim() || PARENT_FALLBACK;
    return { key, familyAccountId: key.familyAccountId, subProfileId: null, isParent: true, name: parentName, parentName };
  }
  const sub = await prisma.subProfile.findUnique({
    where: { id: key.subProfileId },
    select: { displayName: true, familyAccountId: true, familyAccount: { select: { displayName: true } } },
  });
  if (!sub) return null;
  return {
    key,
    familyAccountId: sub.familyAccountId,
    subProfileId: key.subProfileId,
    isParent: false,
    name: sub.displayName,
    parentName: sub.familyAccount.displayName?.trim() || PARENT_FALLBACK,
  };
}

/** Own memos plus memos shared with this family (parent's or any child's). Never DISCUSSION. */
export function visibleMemosWhere(v: MemoViewer): Prisma.BiblePassageMemoWhereInput {
  const own: Prisma.BiblePassageMemoWhereInput = v.subProfileId
    ? { subProfileId: v.subProfileId }
    : { familyAccountId: v.familyAccountId, subProfileId: null };
  return {
    visibility: { in: ["PRIVATE", "FAMILY"] },
    OR: [
      own,
      {
        visibility: "FAMILY",
        OR: [
          { familyAccountId: v.familyAccountId, subProfileId: null },
          { subProfile: { familyAccountId: v.familyAccountId } },
        ],
      },
    ],
  };
}

export const memoAuthorInclude = { subProfile: { select: { displayName: true } } } as const;

type MemoRow = Prisma.BiblePassageMemoGetPayload<{ include: typeof memoAuthorInclude }>;

export function toViewerMemoDto(row: MemoRow, v: MemoViewer): PassageMemoDto {
  const isChild = Boolean(row.subProfileId);
  const mine = v.subProfileId ? row.subProfileId === v.subProfileId : !isChild && row.familyAccountId === v.familyAccountId;
  return {
    id: row.id,
    bookSlug: row.bookSlug,
    chapter: row.chapter,
    startVerse: row.startVerse,
    endVerse: row.endVerse,
    startOffset: row.startOffset,
    endOffset: row.endOffset,
    quotedText: row.quotedText,
    textVersion: row.textVersion,
    body: row.body,
    color: isMemoColor(row.color) ? row.color : DEFAULT_MEMO_COLOR,
    visibility: row.visibility === "FAMILY" ? "FAMILY" : "PRIVATE",
    authorId: isChild ? row.subProfileId! : "parent",
    authorName: isChild ? row.subProfile?.displayName ?? "Child" : v.parentName,
    authorKind: isChild ? "child" : "parent",
    mine,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Load every memo the viewer may see (newest first). */
export async function loadVisibleMemos(v: MemoViewer, extra: Prisma.BiblePassageMemoWhereInput = {}, take = 2000) {
  const rows = await prisma.biblePassageMemo.findMany({
    where: { AND: [visibleMemosWhere(v), extra] },
    include: memoAuthorInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((r) => toViewerMemoDto(r, v));
}

/** Children of the family for the parent's person filter. */
export async function familyChildren(familyAccountId: string) {
  return prisma.subProfile.findMany({
    where: { familyAccountId },
    select: { id: true, displayName: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
