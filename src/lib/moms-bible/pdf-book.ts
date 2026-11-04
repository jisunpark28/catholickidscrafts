/**
 * Keepsake PDF body (design section 8), pure: Bible order, then chapter, then verse.
 * Chapter letters come first in a chapter, then one entry per verse (highlight + notes merged).
 */
import type { MbColorKey } from "./constants";

export type PdfItemIn = {
  authorKind: "PARENT" | "CHILD";
  authorParentId?: string | null;
  kind: "TEXT" | "STICKER";
  body: string | null;
  stickerKey: string | null;
  createdAt: Date;
};

export type PdfNoteIn = {
  id: string;
  authorParentId: string;
  bookSlug: string;
  chapter: number;
  startVerse: number | null;
  endVerse: number | null;
  color: MbColorKey | null;
  situationKey: string | null;
  createdAt: Date;
  items: PdfItemIn[];
};

export type PdfHighlightIn = {
  authorParentId: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  color: MbColorKey | null;
  star: boolean;
  underline: boolean;
  situationKey: string | null;
};

export type PdfEntry = {
  kind: "letter" | "verse";
  bookSlug: string;
  chapter: number;
  startVerse: number | null;
  endVerse: number | null;
  color: MbColorKey | null;
  star: boolean;
  underline: boolean;
  situationKey: string | null;
  notes: (Omit<PdfNoteIn, "items"> & { items: PdfItemIn[] })[];
};

export type PdfOptions = {
  /** Parent printing the book. */
  me: string;
  /** Include the other linked parents' notes and highlights. */
  others: boolean;
  /** Include the child's stickers and replies. */
  replies: boolean;
};

/** Entries sorted in Bible order (bookOrder from the canonical list; unknown books last). */
export function buildPdfEntries(
  notes: readonly PdfNoteIn[],
  highlights: readonly PdfHighlightIn[],
  bookOrder: readonly string[],
  opt: PdfOptions,
): PdfEntry[] {
  const keep = (author: string) => opt.others || author === opt.me;
  const map = new Map<string, PdfEntry>();
  const keyOf = (b: string, c: number, v: number | null) => `${b}|${c}|${v ?? "L"}`;
  const entry = (b: string, c: number, start: number | null, end: number | null): PdfEntry => {
    const k = keyOf(b, c, start);
    let e = map.get(k);
    if (!e) {
      e = {
        kind: start === null ? "letter" : "verse",
        bookSlug: b,
        chapter: c,
        startVerse: start,
        endVerse: end,
        color: null,
        star: false,
        underline: false,
        situationKey: null,
        notes: [],
      };
      map.set(k, e);
    }
    if (start !== null && end !== null && (e.endVerse ?? 0) < end) e.endVerse = end;
    return e;
  };

  for (const n of notes) {
    if (!keep(n.authorParentId)) continue;
    const items = n.items.filter((i) => opt.replies || i.authorKind === "PARENT");
    if (items.length === 0) continue;
    const e = entry(n.bookSlug, n.chapter, n.startVerse, n.endVerse ?? n.startVerse);
    e.notes.push({ ...n, items });
    e.color ??= n.color;
    e.situationKey ??= n.situationKey;
  }
  for (const h of highlights) {
    if (!keep(h.authorParentId)) continue;
    if (!h.color && !h.star && !h.underline) continue;
    const e = entry(h.bookSlug, h.chapter, h.verse, h.verse);
    if (h.authorParentId === opt.me || !e.color) e.color = h.color ?? e.color;
    e.star ||= h.star;
    e.underline ||= h.underline;
    e.situationKey ??= h.situationKey;
  }

  const order = (b: string) => {
    const i = bookOrder.indexOf(b);
    return i === -1 ? 9999 : i;
  };
  return [...map.values()]
    .map((e) => ({ ...e, notes: [...e.notes].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) }))
    .sort(
      (a, b) =>
        order(a.bookSlug) - order(b.bookSlug) ||
        a.chapter - b.chapter ||
        (a.startVerse ?? 0) - (b.startVerse ?? 0),
    );
}

/** "Mom's Prayer Bible for Mia" / "Mom & Dad's Prayer Bible for Mia". */
export function pdfTitle(roles: readonly string[], childName: string): string {
  return `${rolesPhrase(roles)}'s Prayer Bible for ${childName.trim().split(/\s+/)[0] || "you"}`;
}

/** "Mom", "Mom & Dad", "Mom, Dad & Grandma". */
export function rolesPhrase(roles: readonly string[]): string {
  const uniq = [...new Set(roles.filter(Boolean))];
  if (uniq.length === 0) return "Mom";
  return uniq.length === 1 ? uniq[0]! : `${uniq.slice(0, -1).join(", ")} & ${uniq[uniq.length - 1]}`;
}
