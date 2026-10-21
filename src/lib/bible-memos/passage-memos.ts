import type { ReaderKey } from "@/lib/bible/reader";
import type { VerseOffsetTable } from "@/lib/bible-memos/verse-offsets";

/** Server-computed props for memo UI on a chapter page. */
export type PassageMemoSetup = {
  verseTable: VerseOffsetTable;
  textVersion: string;
  signedIn: boolean;
  paid: boolean;
};

export const MEMO_BODY_MAX = 2000;
export const MEMO_QUOTE_MAX = 4000;

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
  color: string | null;
  visibility: "PRIVATE" | "FAMILY" | "DISCUSSION";
  createdAt: string;
  updatedAt: string;
};

export function ownerWhere(key: Exclude<ReaderKey, { type: "guest" }>) {
  return key.type === "owner"
    ? { familyAccountId: key.familyAccountId }
    : { subProfileId: key.subProfileId };
}

export function toMemoDto(row: {
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
  color: string | null;
  visibility: "PRIVATE" | "FAMILY" | "DISCUSSION";
  createdAt: Date;
  updatedAt: Date;
}): PassageMemoDto {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
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
  };
}
