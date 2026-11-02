// Saved custom-sheet thumbnail: a small flattened JPEG/PNG/WebP of the user's edited sheet, made in the
// editor on Save and stored on the owner's CustomSheet row. Only ever rendered inline on the owner's own
// /resource page (rows are always read by familyAccountId), so it never gets a public URL.

/** Longest accepted data URL (~110KB image). Oversized thumbs are dropped, never truncated (a cut data URL is a broken image). */
export const CUSTOM_SHEET_THUMB_MAX_CHARS = 150_000;

const THUMB_RE = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/**
 * Validate a thumbnail sent by the editor.
 * - field absent → undefined (keep whatever is stored)
 * - null, malformed, wrong type or too large → null (clear it, so the grid falls back to the base sheet
 *   instead of showing an out-of-date picture)
 */
export function parseCustomSheetThumb(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  if (value.length > CUSTOM_SHEET_THUMB_MAX_CHARS) return null;
  return THUMB_RE.test(value) ? value : null;
}

/** sessionStorage flag the editor sets after a save so the custom-sheets grid refetches (no stale back-nav cache). */
export const CUSTOM_SHEETS_DIRTY_KEY = "ckc.customSheetsDirty";
