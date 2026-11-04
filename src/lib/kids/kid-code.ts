/**
 * Kid Codes for Mom's Bible child sign-in: "<name letters>-<4 random digits>", e.g. "lily-8492".
 * System-generated, unique per child (SubProfile.kidCode @unique), lower case.
 * The code is not a secret (it shows on the device picker); the 4-digit PIN is.
 * Pure helpers: no DB access, safe to import in tests. Client code should import the format
 * helpers from ./kid-code-format (this file imports Node's crypto).
 */
import { randomInt } from "crypto";

export { KID_CODE_PATTERN, isValidKidCode, normalizeKidCode } from "./kid-code-format";

export const KID_CODE_NAME_MAX = 12;
export const KID_CODE_FALLBACK_NAME = "kid";
/** Collision retries before giving up (10,000 codes per name part). */
export const KID_CODE_MAX_ATTEMPTS = 25;

/** "Lily Anne" -> "lilyanne", "Zoé" -> "zoe", "민지" -> "kid" (fewer than 2 ASCII letters). */
export function kidCodeNamePart(displayName: string): string {
  const letters = displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, KID_CODE_NAME_MAX);
  return letters.length >= 2 ? letters : KID_CODE_FALLBACK_NAME;
}

/** One random candidate: "lily-0427" (digits 0000-9999 from a CSPRNG). */
export function kidCodeCandidate(displayName: string, random: (max: number) => number = randomInt): string {
  const digits = String(random(10_000)).padStart(4, "0");
  return `${kidCodeNamePart(displayName)}-${digits}`;
}

/**
 * Generate a code that `isTaken` says is free, retrying on collision.
 * `isTaken` is the DB check (e.g. prisma.subProfile.findUnique({ where: { kidCode } })).
 * Callers must still handle a unique-constraint race on insert (P2002) by retrying.
 */
export async function generateUniqueKidCode(
  displayName: string,
  isTaken: (code: string) => Promise<boolean>,
  random: (max: number) => number = randomInt,
): Promise<string> {
  for (let attempt = 0; attempt < KID_CODE_MAX_ATTEMPTS; attempt++) {
    const code = kidCodeCandidate(displayName, random);
    if (!(await isTaken(code))) return code;
  }
  throw new Error("Could not generate a unique Kid Code");
}
