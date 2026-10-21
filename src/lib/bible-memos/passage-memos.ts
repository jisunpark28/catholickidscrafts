import type { ReaderKey } from "@/lib/bible/reader";
import type { VerseOffsetTable } from "@/lib/bible-memos/verse-offsets";

/** Server-computed props for memo UI on a chapter page. */
export type PassageMemoSetup = {
  verseTable: VerseOffsetTable;
  textVersion: string;
  signedIn: boolean;
  paid: boolean;
};

export const MEMO_BODY_MAX = 1000;
export const MEMO_QUOTE_MAX = 4000;

/** Highlight colors (key → swatch, highlight background, label). */
export const MEMO_COLORS = [
  { key: "yellow", swatch: "#e8b04b", bg: "rgba(253,226,120,.55)", label: "Yellow" },
  { key: "sky", swatch: "#3b9be8", bg: "rgba(147,207,255,.5)", label: "Sky blue" },
  { key: "green", swatch: "#4caf50", bg: "rgba(170,230,150,.55)", label: "Light green" },
  { key: "pink", swatch: "#e8609a", bg: "rgba(255,170,205,.5)", label: "Pink" },
  { key: "purple", swatch: "#8b5cf6", bg: "rgba(205,180,255,.55)", label: "Purple" },
] as const;
export type MemoColor = (typeof MEMO_COLORS)[number]["key"];
export const DEFAULT_MEMO_COLOR: MemoColor = "yellow";

export function isMemoColor(v: unknown): v is MemoColor {
  return typeof v === "string" && MEMO_COLORS.some((c) => c.key === v);
}
export function memoColor(v: string | null | undefined) {
  return MEMO_COLORS.find((c) => c.key === v) ?? MEMO_COLORS[0];
}

/** Only these two are ever accepted or returned (DISCUSSION is reserved). */
export type MemoVisibility = "PRIVATE" | "FAMILY";
export function isMemoVisibility(v: unknown): v is MemoVisibility {
  return v === "PRIVATE" || v === "FAMILY";
}

export type PassageMemoDto = {
  id: string;
  bookSlug: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  startOffset: number | null;
  endOffset: number | null;
  quotedText: string;
  textVersion: string;
  body: string;
  color: MemoColor;
  visibility: MemoVisibility;
  /** "parent" for the family owner, else the child's subProfileId. */
  authorId: string;
  authorName: string;
  authorKind: "parent" | "child";
  /** True when the current reader wrote it (only the author may edit/delete/share). */
  mine: boolean;
  createdAt: string;
  updatedAt: string;
};

export function ownerWhere(key: Exclude<ReaderKey, { type: "guest" }>) {
  return key.type === "owner"
    ? { familyAccountId: key.familyAccountId }
    : { subProfileId: key.subProfileId };
}

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

export type MemoInput = {
  bookSlug: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  startOffset: number | null;
  endOffset: number | null;
  quotedText: string;
  textVersion: string;
  body: string;
  color: MemoColor;
  visibility: MemoVisibility;
};

/** Validate a POST body. Returns an error string or the clean input. */
export function parseMemoInput(raw: unknown): MemoInput | string {
  if (!raw || typeof raw !== "object") return "Invalid body";
  const b = raw as Record<string, unknown>;
  const bookSlug = typeof b.bookSlug === "string" ? b.bookSlug.trim() : "";
  if (!/^[a-z0-9-]{1,40}$/.test(bookSlug)) return "bookSlug is required";
  if (!isInt(b.chapter) || b.chapter < 1 || b.chapter > 200) return "chapter is invalid";
  if (!isInt(b.startVerse) || !isInt(b.endVerse) || b.startVerse < 1 || b.endVerse < b.startVerse || b.endVerse > 200)
    return "verse range is invalid";
  let startOffset: number | null = null;
  let endOffset: number | null = null;
  if (b.startOffset != null || b.endOffset != null) {
    if (!isInt(b.startOffset) || !isInt(b.endOffset) || b.startOffset < 0 || b.endOffset <= b.startOffset)
      return "offsets are invalid";
    startOffset = b.startOffset;
    endOffset = b.endOffset;
  }
  const quotedText = typeof b.quotedText === "string" ? b.quotedText.trim() : "";
  if (!quotedText || quotedText.length > MEMO_QUOTE_MAX) return "quotedText is invalid";
  const textVersion = typeof b.textVersion === "string" ? b.textVersion.trim() : "";
  if (!textVersion || textVersion.length > 64) return "textVersion is invalid";
  const body = typeof b.body === "string" ? b.body.trim() : "";
  if (!body) return "Memo is empty";
  if (body.length > MEMO_BODY_MAX) return `Memo must be ${MEMO_BODY_MAX} characters or fewer`;
  if (b.color != null && !isMemoColor(b.color)) return "color is invalid";
  if (b.visibility != null && !isMemoVisibility(b.visibility)) return "visibility is invalid";
  return {
    bookSlug,
    chapter: b.chapter,
    startVerse: b.startVerse,
    endVerse: b.endVerse,
    startOffset,
    endOffset,
    quotedText,
    textVersion,
    body,
    color: isMemoColor(b.color) ? b.color : DEFAULT_MEMO_COLOR,
    visibility: isMemoVisibility(b.visibility) ? b.visibility : "PRIVATE",
  };
}

export type MemoPatch = { body?: string; color?: MemoColor; visibility?: MemoVisibility };

/** Validate a PATCH body (any of body, color, visibility). */
export function parseMemoPatch(raw: unknown): MemoPatch | string {
  if (!raw || typeof raw !== "object") return "Invalid body";
  const b = raw as Record<string, unknown>;
  const out: MemoPatch = {};
  if (b.body !== undefined) {
    const body = typeof b.body === "string" ? b.body.trim() : "";
    if (!body) return "Memo is empty";
    if (body.length > MEMO_BODY_MAX) return `Memo must be ${MEMO_BODY_MAX} characters or fewer`;
    out.body = body;
  }
  if (b.color !== undefined) {
    if (!isMemoColor(b.color)) return "color is invalid";
    out.color = b.color;
  }
  if (b.visibility !== undefined) {
    if (!isMemoVisibility(b.visibility)) return "visibility is invalid";
    out.visibility = b.visibility;
  }
  if (Object.keys(out).length === 0) return "Nothing to update";
  return out;
}

/** "Oct 18, 2026" style date for memo cards. */
export function formatMemoDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** "Mom's memo" / "Lucas's memo" label for shared memos. */
export function authorMemoLabel(name: string): string {
  return `${name}\u2019s memo`;
}

/** Shared filters for My memos and its print view. person: "all" | "me" | authorId. */
export type MemoFilters = { person: string; color: string; book: string; q: string };

export function filterMemos<T extends PassageMemoDto>(list: T[], f: MemoFilters): T[] {
  const q = f.q.trim().toLowerCase();
  return list.filter(
    (m) =>
      (f.person === "all" || !f.person || (f.person === "me" ? m.mine : m.authorId === f.person)) &&
      (!f.color || f.color === "all" || m.color === f.color) &&
      (!f.book || m.bookSlug === f.book) &&
      (!q || m.body.toLowerCase().includes(q) || m.quotedText.toLowerCase().includes(q)),
  );
}
