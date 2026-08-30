/** Map Unicode dash/hyphen variants to ASCII hyphen-minus (keyboard "-"). */
const DASH_LIKE = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g;

/** Normalize passage text for fair typing comparison. */
export function normalizePassageText(text: string): string {
  return normalizeTypingInput(text).trim();
}

/**
 * Normalize in-progress typing without trimming the end — trailing spaces and
 * punctuation at the frontier must count while the user is still typing.
 */
export function normalizeTypingInput(text: string): string {
  return text
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035`´ʹʻʼʽ′]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u00AB\u00BB\u2039\u203A]/g, '"')
    .replace(DASH_LIKE, "-")
    .replace(/\u00AD/g, "") // soft hyphen — invisible, not typed
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trimStart();
}

/** Count characters that match at each index (not prefix-only). */
export function countMatchingChars(typed: string, target: string): number {
  const limit = Math.min(typed.length, target.length);
  let correct = 0;
  for (let i = 0; i < limit; i++) {
    if (typed[i] === target[i]) correct++;
  }
  return correct;
}

export function typingAccuracy(typed: string, target: string): number {
  if (!target.length) return 0;
  return countMatchingChars(typed, target) / target.length;
}
