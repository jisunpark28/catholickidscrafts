/**
 * Memo import (design section 9): copy a parent's own Bible memos into a child's Mom's Bible.
 * Originals are never changed (My Memos keeps them for the Gospel faith journal). Server only.
 */
import { isDouaySlug } from "@/lib/bible/ref-map";
import { prisma } from "@/lib/prisma";
import { memosToImport, shouldOfferImport } from "./memo-import";
import { ensureParentSettings } from "./notify";

/** One request never copies more than this many memos (the dialog can run again for the rest). */
export const MEMO_IMPORT_MAX = 1000;

/** The parent's own memos (not a child's) that were not copied yet. */
async function pendingMemos(parentId: string) {
  const memos = await prisma.biblePassageMemo.findMany({
    where: { familyAccountId: parentId, subProfileId: null },
    select: { id: true, bookSlug: true, chapter: true, startVerse: true, endVerse: true, body: true, color: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  if (memos.length === 0) return [];
  const done = await prisma.mbNote.findMany({
    where: { importedFromMemoId: { in: memos.map((m) => m.id) } },
    select: { importedFromMemoId: true },
  });
  const imported = new Set(done.map((d) => d.importedFromMemoId).filter((x): x is string => Boolean(x)));
  return memosToImport(
    memos.filter((m) => isDouaySlug(m.bookSlug) && m.chapter > 0),
    imported,
  );
}

export async function importableMemoCount(parentId: string): Promise<number> {
  return (await pendingMemos(parentId)).length;
}

/** The "Move your N notes" offer for /account (null when there is nothing to offer). */
export async function memoImportOffer(parentId: string, opts: { force?: boolean } = {}): Promise<{ count: number } | null> {
  const settings = await prisma.mbParentSettings.findUnique({
    where: { parentAccountId: parentId },
    select: { memoImportPromptAt: true, memoImportDoneAt: true },
  });
  if (settings?.memoImportDoneAt) return null;
  const count = await importableMemoCount(parentId);
  const offer = shouldOfferImport(
    { count, promptAt: settings?.memoImportPromptAt ?? null, doneAt: settings?.memoImportDoneAt ?? null },
    opts.force,
  );
  return offer ? { count } : null;
}

/** Copy every pending memo into the child's Bible in one transaction. */
export async function runMemoImport(parentId: string, childId: string): Promise<{ imported: number }> {
  const data = (await pendingMemos(parentId)).slice(0, MEMO_IMPORT_MAX);
  if (data.length > 0) {
    await prisma.$transaction(
      data.map((d) =>
        prisma.mbNote.create({
          data: {
            subProfileId: childId,
            authorParentId: parentId,
            bookSlug: d.bookSlug,
            chapter: d.chapter,
            startVerse: d.startVerse,
            endVerse: d.endVerse,
            color: d.color,
            importedFromMemoId: d.importedFromMemoId,
            createdAt: d.createdAt,
            lastActivityAt: d.createdAt,
            items: {
              create: { authorKind: "PARENT", authorParentId: parentId, kind: "TEXT", body: d.body, createdAt: d.createdAt },
            },
          },
          select: { id: true },
        }),
      ),
    );
  }
  await markImport(parentId, "done");
  return { imported: data.length };
}

export async function markImport(parentId: string, what: "done" | "dismissed"): Promise<void> {
  await ensureParentSettings(parentId);
  await prisma.mbParentSettings.update({
    where: { parentAccountId: parentId },
    data: what === "done" ? { memoImportDoneAt: new Date() } : { memoImportPromptAt: new Date() },
  });
}
