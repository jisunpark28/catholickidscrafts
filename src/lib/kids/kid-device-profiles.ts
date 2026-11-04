/**
 * Device profile picker list (Netflix-style tiles on /kids), kept in localStorage.
 * Holds ONLY { code, name } per child (Kid Code + first name): never a PIN, token,
 * family id or email. Everything read back is re-validated and stripped to those two fields.
 */
import { isValidKidCode, normalizeKidCode } from "./kid-code-format";

export const KID_PROFILES_STORAGE_KEY = "ckc.kidProfiles";
export const KID_PROFILES_MAX = 8;
export const KID_PROFILE_NAME_MAX = 20;

export type KidDeviceProfile = { code: string; name: string };

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function storage(s?: StorageLike | null): StorageLike | null {
  if (s) return s;
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** First name only, trimmed and capped (the picker never needs more). */
export function kidProfileName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0] ?? "";
  return first.slice(0, KID_PROFILE_NAME_MAX);
}

function sanitize(raw: unknown): KidDeviceProfile[] {
  if (!Array.isArray(raw)) return [];
  const out: KidDeviceProfile[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.code !== "string" || typeof rec.name !== "string") continue;
    const code = normalizeKidCode(rec.code);
    if (!isValidKidCode(code) || seen.has(code)) continue;
    const name = kidProfileName(rec.name) || code.split("-")[0]!;
    seen.add(code);
    out.push({ code, name });
    if (out.length >= KID_PROFILES_MAX) break;
  }
  return out;
}

export function readKidProfiles(s?: StorageLike | null): KidDeviceProfile[] {
  const st = storage(s);
  if (!st) return [];
  try {
    return sanitize(JSON.parse(st.getItem(KID_PROFILES_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function write(list: KidDeviceProfile[], s?: StorageLike | null): KidDeviceProfile[] {
  const clean = sanitize(list);
  const st = storage(s);
  try {
    if (clean.length === 0) st?.removeItem(KID_PROFILES_STORAGE_KEY);
    else st?.setItem(KID_PROFILES_STORAGE_KEY, JSON.stringify(clean.map(({ code, name }) => ({ code, name }))));
  } catch {
    /* storage full or blocked: the picker just won't remember */
  }
  return clean;
}

/** Add or refresh a tile (moved to the front). Call only after a successful sign-in. */
export function saveKidProfile(profile: KidDeviceProfile, s?: StorageLike | null): KidDeviceProfile[] {
  const code = normalizeKidCode(profile.code);
  const rest = readKidProfiles(s).filter((p) => p.code !== code);
  return write([{ code, name: profile.name }, ...rest].slice(0, KID_PROFILES_MAX), s);
}

export function removeKidProfile(code: string, s?: StorageLike | null): KidDeviceProfile[] {
  const target = normalizeKidCode(code);
  return write(readKidProfiles(s).filter((p) => p.code !== target), s);
}

export function clearKidProfiles(s?: StorageLike | null): void {
  try {
    storage(s)?.removeItem(KID_PROFILES_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
