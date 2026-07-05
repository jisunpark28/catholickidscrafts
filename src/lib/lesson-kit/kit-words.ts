import type { LessonBlockDto } from "@/lib/lesson-kit/types";

export type LessonKitWordEntry = {
  word: string;
  hint?: string;
};

/** One word per line; optional hint after `|` or `,`. */
export function parseKitWordsText(raw: string): LessonKitWordEntry[] {
  const seen = new Set<string>();
  const out: LessonKitWordEntry[] = [];

  for (const line of raw.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let word = trimmed;
    let hint = "";

    const pipe = trimmed.indexOf("|");
    if (pipe >= 0) {
      word = trimmed.slice(0, pipe).trim();
      hint = trimmed.slice(pipe + 1).trim();
    } else {
      const comma = trimmed.indexOf(",");
      if (comma >= 0) {
        word = trimmed.slice(0, comma).trim();
        hint = trimmed.slice(comma + 1).trim();
      }
    }

    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hint ? { word, hint } : { word });
  }

  return out;
}

export function kitWordsToText(entries: LessonKitWordEntry[]): string {
  return entries
    .map((e) => (e.hint?.trim() ? `${e.word} | ${e.hint.trim()}` : e.word))
    .join("\n");
}

export function normalizeKitWordEntries(raw: unknown): LessonKitWordEntry[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: LessonKitWordEntry[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      const word = item.trim();
      if (!word) continue;
      const key = word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ word });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const word = String(row.word ?? "").trim();
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const hint = String(row.hint ?? "").trim();
    out.push(hint ? { word, hint } : { word });
  }

  return out;
}

/** Words saved on this lesson block (never from global game DB). */
export function lessonKitWords(block: LessonBlockDto): LessonKitWordEntry[] {
  const fromKit = normalizeKitWordEntries(block.config.kitWords);
  if (fromKit.length > 0) return fromKit;

  const legacy = block.config.words;
  if (Array.isArray(legacy) && legacy.length > 0) {
    return normalizeKitWordEntries(legacy);
  }

  return [];
}

export function lessonKitWordsForTyping(
  entries: LessonKitWordEntry[],
): { id: string; word: string; hint: string; sortOrder: number }[] {
  return entries.map((e, i) => ({
    id: `kit-${i}`,
    word: e.word,
    hint: e.hint ?? "",
    sortOrder: 0,
  }));
}
