/** Normalize passage text for fair typing comparison (spaces, nbsp). */
export function normalizePassageText(text: string): string {
  return text.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
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
