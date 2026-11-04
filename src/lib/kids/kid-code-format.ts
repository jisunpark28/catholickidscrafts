/**
 * Kid Code format helpers with no Node imports, so client components (the /kids picker,
 * device profile storage) can use them without bundling "crypto". Re-exported by kid-code.ts.
 */
export const KID_CODE_PATTERN = /^[a-z]{2,12}-\d{4}$/;

/** Trim + lower-case what a child or parent typed ("Lily-8492 " -> "lily-8492"). */
export function normalizeKidCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function isValidKidCode(code: string): boolean {
  return KID_CODE_PATTERN.test(code);
}
