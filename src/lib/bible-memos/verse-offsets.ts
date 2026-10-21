import { normalizePassageText, normalizeTypingInput } from "@/lib/typing-accuracy";

/** Start offset of each verse inside the normalized chapter typing text. */
export type VerseOffset = { verse: number; start: number };

export type VerseOffsetTable = {
  /** Sorted by start. */
  verses: VerseOffset[];
  /** Length of the normalized chapter text these offsets were computed against. */
  length: number;
};

/**
 * Build a verse offset table for `verseTexts.join(" ")` after the same normalization
 * PassageTypingGame applies (`normalizePassageText`). Returns null if the verification
 * fails, so callers can disable verse-anchored features instead of mis-anchoring.
 */
export function buildVerseOffsetTable(
  verses: { verse: number; text: string }[],
): VerseOffsetTable | null {
  if (verses.length === 0) return null;
  const full = normalizePassageText(verses.map((v) => v.text).join(" "));
  const out: VerseOffset[] = [];
  let prefixRaw = "";
  for (let i = 0; i < verses.length; i++) {
    // normalizeTypingInput collapses whitespace and trims the start, but never the end,
    // so the normalized prefix length (including the joining space) is this verse's start.
    const start = i === 0 ? 0 : normalizeTypingInput(prefixRaw + " ").length;
    out.push({ verse: verses[i]!.verse, start });
    prefixRaw = i === 0 ? verses[i]!.text : `${prefixRaw} ${verses[i]!.text}`;
  }

  // Verify: each verse's normalized text must appear at its start offset.
  for (let i = 0; i < out.length; i++) {
    const piece = normalizePassageText(verses[i]!.text);
    if (!piece) continue;
    if (full.slice(out[i]!.start, out[i]!.start + piece.length) !== piece) return null;
  }
  return { verses: out, length: full.length };
}

/** Verse number containing character index `offset`. */
export function verseAtOffset(table: VerseOffsetTable, offset: number): number {
  const list = table.verses;
  let lo = 0;
  let hi = list.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid]!.start <= offset) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return list[ans]!.verse;
}

/** Verse range for a [start, end) character selection. */
export function offsetsToVerseRange(
  table: VerseOffsetTable,
  start: number,
  end: number,
): { startVerse: number; endVerse: number } {
  const a = Math.max(0, Math.min(start, end));
  const b = Math.max(a + 1, Math.max(start, end));
  return { startVerse: verseAtOffset(table, a), endVerse: verseAtOffset(table, b - 1) };
}

/** Character [start, end) range covering whole verses startVerse..endVerse. */
export function verseRangeToOffsets(
  table: VerseOffsetTable,
  startVerse: number,
  endVerse: number,
): { start: number; end: number } | null {
  const lo = Math.min(startVerse, endVerse);
  const hi = Math.max(startVerse, endVerse);
  const firstIdx = table.verses.findIndex((v) => v.verse === lo);
  const lastIdx = table.verses.findIndex((v) => v.verse === hi);
  if (firstIdx < 0 || lastIdx < 0) return null;
  const start = table.verses[firstIdx]!.start;
  const next = table.verses[lastIdx + 1];
  // Exclude the joining space before the next verse.
  const end = next ? next.start - 1 : table.length;
  return { start, end: Math.max(start + 1, end) };
}

/** Short stable hash of the normalized chapter text (FNV-1a, 32-bit hex). */
export function chapterTextVersion(normalizedText: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < normalizedText.length; i++) {
    h ^= normalizedText.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `fnv1a-${(h >>> 0).toString(16).padStart(8, "0")}-${normalizedText.length}`;
}
