/**
 * Client-safe helpers that tie Mom's Bible marks (storage verse numbers) to what the reader shows.
 * A storage verse without its own official number ("continued" / no counterpart) belongs to the
 * previous numbered verse, so marks and notes always sit on a verse the reader can see.
 */
import type { VerseLabel } from "@/lib/bible/chapter-pages";

export type VerseMarker = { verse: number; start: number };

/** storage verse -> owning numbered storage verse. */
export function ownerVerseMap(markers: readonly VerseMarker[], labels: readonly VerseLabel[]): Map<number, number> {
  const byVerse = new Map(labels.map((l) => [l.verse, l]));
  const out = new Map<number, number>();
  let owner: number | null = null;
  for (const m of markers) {
    const l = byVerse.get(m.verse);
    const numbered = Boolean(l && !l.continued && !l.douay);
    if (numbered || owner === null) owner = m.verse;
    out.set(m.verse, owner);
  }
  return out;
}

/** Owning verse for every character of the normalized passage text (-1 before the first marker). */
export function charOwnerVerses(textLength: number, markers: readonly VerseMarker[], owners: Map<number, number>): Int32Array {
  const arr = new Int32Array(textLength).fill(-1);
  const sorted = [...markers].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i]!;
    const end = i + 1 < sorted.length ? sorted[i + 1]!.start : textLength;
    arr.fill(owners.get(m.verse) ?? m.verse, Math.max(0, m.start), Math.min(textLength, end));
  }
  return arr;
}

/** Text of each owning verse (continued verses appended). */
export function ownerVerseTexts(
  text: string,
  markers: readonly VerseMarker[],
  owners: Map<number, number>,
): Map<number, string> {
  const sorted = [...markers].sort((a, b) => a.start - b.start);
  const out = new Map<number, string>();
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i]!;
    const end = i + 1 < sorted.length ? sorted[i + 1]!.start : text.length;
    const owner = owners.get(m.verse) ?? m.verse;
    const piece = text.slice(m.start, end).trim();
    out.set(owner, out.has(owner) ? `${out.get(owner)} ${piece}` : piece);
  }
  return out;
}

export function clip(text: string, max = 220): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}
