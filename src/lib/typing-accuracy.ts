/** Normalize passage text for fair typing comparison. */
export function normalizePassageText(text: string): string {
  return text
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035`´ʹʻʼʽ′]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u00AB\u00BB\u2039\u203A]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim();
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
