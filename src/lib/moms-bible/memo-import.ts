/**
 * Memo import (design section 9), pure parts. Each parent memo becomes one verse note with one
 * parent text item; the original BiblePassageMemo rows are never changed.
 */
import type { MbColorKey } from "./constants";

export const MEMO_COLOR_MAP: Record<string, MbColorKey> = {
  yellow: "YELLOW",
  green: "GREEN",
  sky: "BLUE",
  pink: "PINK",
  purple: "PINK",
};

export type ImportableMemo = {
  id: string;
  bookSlug: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  body: string;
  color: string;
  createdAt: Date;
};

export type ImportedNoteData = {
  importedFromMemoId: string;
  bookSlug: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  color: MbColorKey;
  body: string;
  createdAt: Date;
};

/** Memos not imported yet, mapped to note data (idempotent: already-imported ids are skipped). */
export function memosToImport(memos: readonly ImportableMemo[], alreadyImported: ReadonlySet<string>): ImportedNoteData[] {
  const out: ImportedNoteData[] = [];
  for (const m of memos) {
    if (alreadyImported.has(m.id)) continue;
    const body = m.body.trim();
    if (!body) continue;
    const start = Math.max(1, Math.min(m.startVerse, m.endVerse));
    const end = Math.max(start, m.startVerse, m.endVerse);
    out.push({
      importedFromMemoId: m.id,
      bookSlug: m.bookSlug,
      chapter: m.chapter,
      startVerse: start,
      endVerse: end,
      color: MEMO_COLOR_MAP[m.color] ?? "YELLOW",
      body: body.slice(0, 2000),
      createdAt: m.createdAt,
    });
  }
  return out;
}

/** Show the "Move your N notes" offer? Only before it was done or dismissed, and with memos to move. */
export function shouldOfferImport(f: { count: number; promptAt: Date | null; doneAt: Date | null }, force = false): boolean {
  if (f.count === 0 || f.doneAt) return false;
  return force || !f.promptAt;
}
