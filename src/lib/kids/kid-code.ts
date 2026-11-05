/**
 * Kid Codes for Mom's Bible child sign-in: the child's name letters only, e.g. "lily".
 * Unique per child across the site (SubProfile.kidCode @unique), lower case. If the name
 * gives no usable code (fewer than 2 letters a-z, e.g. a Korean name) or the code is already
 * taken, the parent types a different letters-only code. Older codes with 4 digits
 * ("lily-8492") keep working for sign-in.
 * The code is not a secret (it shows on the device picker); the 4-digit PIN is.
 * Pure helpers: no DB access, safe to import in tests. Client code should import the format
 * helpers from ./kid-code-format.
 */
import { isValidNewKidCode, normalizeKidCode } from "./kid-code-format";

export {
  KID_CODE_PATTERN,
  NEW_KID_CODE_PATTERN,
  isValidKidCode,
  isValidNewKidCode,
  normalizeKidCode,
} from "./kid-code-format";

export const KID_CODE_NAME_MAX = 12;

/** Same message for every taken code: says nothing about who has it. */
export const KID_CODE_TAKEN_ERROR =
  "That Kid Code is already taken. Please type a different one (letters only, like \"lilyanne\").";
export const KID_CODE_INVALID_ERROR = "A Kid Code is 2-12 letters (a-z) only, like \"lily\".";
export const KID_CODE_NEEDED_ERROR =
  "Please type a Kid Code for this child: 2-12 letters (a-z) only, like \"lily\".";

/** "Lily Anne" -> "lilyanne", "Zoé" -> "zoe"; null when fewer than 2 ASCII letters (e.g. "민지"). */
export function kidCodeNamePart(displayName: string): string | null {
  const letters = displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, KID_CODE_NAME_MAX);
  return letters.length >= 2 ? letters : null;
}

export type NewKidCodeResult =
  | { ok: true; code: string }
  /** needs_code: the name gives no usable code; taken / invalid: the parent must type another. */
  | { ok: false; reason: "needs_code" | "taken" | "invalid"; error: string };

/**
 * Pick the Kid Code for a new child or for "New Kid Code".
 * - `requested` (typed by the parent): must be letters only and free.
 * - Otherwise the child's name letters, if usable and free.
 * `isTaken` is the DB check (e.g. prisma.subProfile.findUnique({ where: { kidCode } })).
 * Callers must still handle a unique-constraint race on write (P2002) as "taken".
 */
export async function resolveNewKidCode(
  displayName: string,
  requested: string | null | undefined,
  isTaken: (code: string) => Promise<boolean>,
): Promise<NewKidCodeResult> {
  const typed = typeof requested === "string" ? normalizeKidCode(requested) : "";
  if (typed) {
    if (!isValidNewKidCode(typed)) return { ok: false, reason: "invalid", error: KID_CODE_INVALID_ERROR };
    if (await isTaken(typed)) return { ok: false, reason: "taken", error: KID_CODE_TAKEN_ERROR };
    return { ok: true, code: typed };
  }
  const fromName = kidCodeNamePart(displayName);
  if (!fromName) return { ok: false, reason: "needs_code", error: KID_CODE_NEEDED_ERROR };
  if (await isTaken(fromName)) return { ok: false, reason: "taken", error: KID_CODE_TAKEN_ERROR };
  return { ok: true, code: fromName };
}
