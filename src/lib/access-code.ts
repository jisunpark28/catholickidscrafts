import { createHash, randomInt } from "crypto";
import bcrypt from "bcryptjs";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const MAX_SUB_PROFILES_PER_FAMILY = 30;

/** Format: CKC-XXXX-XXXX (no ambiguous 0/O/1/I). */
export function generateAccessCode(): string {
  const segment = () =>
    Array.from({ length: 4 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
  return `CKC-${segment()}-${segment()}`;
}

export function normalizeAccessCode(raw: string): string {
  const upper = raw.trim().toUpperCase();
  const compact = upper.replace(/[^A-Z0-9]/g, "");
  if (compact.length === 8) {
    return `CKC-${compact.slice(0, 4)}-${compact.slice(4)}`;
  }
  return upper.replace(/\s+/g, "");
}

export function accessCodeLookupKey(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

export async function hashAccessCode(normalized: string): Promise<string> {
  return bcrypt.hash(normalized, 10);
}

export async function verifyAccessCode(normalized: string, hash: string): Promise<boolean> {
  return bcrypt.compare(normalized, hash);
}

export function accessCodeLast4(normalized: string): string {
  const alnum = normalized.replace(/[^A-Z0-9]/g, "");
  return alnum.slice(-4);
}

export function isValidAccessCodeFormat(normalized: string): boolean {
  return /^CKC-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(normalized);
}
