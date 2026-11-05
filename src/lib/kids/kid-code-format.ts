/**
 * Kid Code format helpers with no Node imports, so client components (the /kids picker,
 * device profile storage) can use them without bundling "crypto". Re-exported by kid-code.ts.
 */
/** Sign-in format: new name-only codes ("lily") and legacy codes with 4 digits ("lily-8492"). */
export const KID_CODE_PATTERN = /^[a-z]{2,12}(-\d{4})?$/;
/** New codes (generated from the name or typed by a parent): 2-12 letters a-z only. */
export const NEW_KID_CODE_PATTERN = /^[a-z]{2,12}$/;

/** Trim + lower-case what a child or parent typed ("Lily " -> "lily"). */
export function normalizeKidCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function isValidKidCode(code: string): boolean {
  return KID_CODE_PATTERN.test(code);
}

/** True for a code a parent may choose now (letters only; legacy "-1234" codes aren't issued). */
export function isValidNewKidCode(code: string): boolean {
  return NEW_KID_CODE_PATTERN.test(code);
}
