import { createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { GOOGLE_FRESH_AUTH_MAX_AGE_SEC } from "@/lib/google-oauth";

/**
 * Leaving child mode on a locked device.
 *
 * 1. Google: only a verified ID token whose auth_time is very recent counts (the grown-up
 *    typed their Google password just now). Google cannot be forced to ask for the password
 *    (prompt=login is unsupported and max_age is ignored), so a long-lived Google session
 *    on the device never unlocks it by itself.
 * 2. Email code: a 6-digit code sent to the family account's email. The code is never stored;
 *    the browser keeps an HttpOnly, signed challenge (HMAC of the code) bound to the current
 *    device lock, valid 10 minutes, 5 tries, single use. Only the newest code of a family
 *    counts: sending a new code or using one voids every earlier code (server-side record,
 *    see device-unlock-store.ts).
 */

export type FreshReauthInput = {
  nowSec: number;
  idToken: { sub: string; nonce: string | null; authTime: number | null } | null;
  /** userinfo "sub" for this sign-in. */
  profileGoogleId: string;
  /** FamilyAccount.googleId the sign-in resolved to. */
  accountGoogleId: string | null;
  /** Nonce inside the signed OAuth state. */
  stateNonce: string;
  /** Nonce in this browser's ckc_oauth_nonce cookie. */
  boundNonce: string | null;
};

/** True only for a verified, same-browser, just-now Google authentication of this account. */
export function isFreshGoogleReauth(i: FreshReauthInput): boolean {
  const t = i.idToken;
  if (!t) return false;
  if (t.sub !== i.profileGoogleId || i.accountGoogleId !== t.sub) return false;
  if (!t.nonce || t.nonce !== i.stateNonce || i.boundNonce !== i.stateNonce) return false;
  if (typeof t.authTime !== "number") return false;
  if (t.authTime > i.nowSec + 60) return false;
  return i.nowSec - t.authTime <= GOOGLE_FRESH_AUTH_MAX_AGE_SEC;
}

export const DEVICE_UNLOCK_COOKIE = "ckc_unlock";
export const DEVICE_UNLOCK_PATH = "/api/auth/family/unlock";
export const DEVICE_UNLOCK_TTL_SEC = 10 * 60;
export const DEVICE_UNLOCK_MAX_TRIES = 5;

export function deviceUnlockCookieOptions(value: string, maxAge = DEVICE_UNLOCK_TTL_SEC) {
  return {
    name: DEVICE_UNLOCK_COOKIE,
    value,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: DEVICE_UNLOCK_PATH,
    maxAge,
  };
}

function secret(): string {
  const s = process.env.AUTH_SECRET?.trim();
  if (!s) throw new Error("AUTH_SECRET is required for device unlock");
  return s;
}

function codeHash(nonce: string, code: string): string {
  return createHmac("sha256", secret()).update(`device-unlock:${nonce}:${code}`).digest("base64url");
}

export function isUnlockCodeFormat(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code);
}

export type UnlockLockRef = { familyAccountId: string; lockedAt: number };

export async function createUnlockChallenge(
  lock: UnlockLockRef,
  nowSec = Math.floor(Date.now() / 1000),
): Promise<{ code: string; token: string; nonce: string }> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const nonce = randomUUID();
  const token = await new SignJWT({
    kind: "device-unlock",
    fid: lock.familyAccountId,
    lat: lock.lockedAt,
    n: nonce,
    ch: codeHash(nonce, code),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(nowSec)
    .setExpirationTime(nowSec + DEVICE_UNLOCK_TTL_SEC)
    .sign(new TextEncoder().encode(secret()));
  return { code, token, nonce };
}

export type UnlockChallenge = { familyAccountId: string; lockedAt: number; nonce: string; issuedAt: number; hash: string };

/** Signature, kind and expiry only (no code check). */
export async function readUnlockChallenge(
  token: string | undefined | null,
  nowSec = Math.floor(Date.now() / 1000),
): Promise<UnlockChallenge | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret()), {
      currentDate: new Date(nowSec * 1000),
    });
    if (payload.kind !== "device-unlock") return null;
    const { fid, lat, n, ch, iat } = payload as Record<string, unknown>;
    if (typeof fid !== "string" || typeof lat !== "number" || typeof n !== "string" || typeof ch !== "string") {
      return null;
    }
    const issuedAt = typeof iat === "number" ? iat : 0;
    if (nowSec - issuedAt > DEVICE_UNLOCK_TTL_SEC || issuedAt > nowSec + 60) return null;
    return { familyAccountId: fid, lockedAt: lat, nonce: n, issuedAt, hash: ch };
  } catch {
    return null;
  }
}

export type UnlockCheck =
  | { ok: true; familyAccountId: string; nonce: string }
  | { ok: false; reason: "expired" | "lock_changed" | "wrong_code"; nonce: string | null };

/** The challenge must be valid, belong to the device's current lock, and match the code. */
export async function checkUnlockCode(
  token: string | undefined | null,
  code: string,
  lock: UnlockLockRef,
  nowSec = Math.floor(Date.now() / 1000),
): Promise<UnlockCheck> {
  const ch = await readUnlockChallenge(token, nowSec);
  if (!ch) return { ok: false, reason: "expired", nonce: null };
  if (ch.familyAccountId !== lock.familyAccountId || ch.lockedAt !== lock.lockedAt) {
    return { ok: false, reason: "lock_changed", nonce: ch.nonce };
  }
  if (!isUnlockCodeFormat(code)) return { ok: false, reason: "wrong_code", nonce: ch.nonce };
  const a = Buffer.from(codeHash(ch.nonce, code));
  const b = Buffer.from(ch.hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "wrong_code", nonce: ch.nonce };
  return { ok: true, familyAccountId: ch.familyAccountId, nonce: ch.nonce };
}

/** Server-side record of the newest unlock code per family ("AuthRateLimit" rows, no extra table). */
export function unlockCurrentPrefix(familyAccountId: string): string {
  return `unlock-current:${familyAccountId}:`;
}

/** Nonce of the newest issued challenge, or null when there is none. */
export function newestUnlockNonce(
  rows: ReadonlyArray<{ key: string; windowStart: Date }>,
  prefix: string,
): string | null {
  let best: { key: string; t: number } | null = null;
  for (const r of rows) {
    if (!r.key.startsWith(prefix)) continue;
    const t = r.windowStart.getTime();
    if (!best || t > best.t || (t === best.t && r.key > best.key)) best = { key: r.key, t };
  }
  return best ? best.key.slice(prefix.length) : null;
}

/** "jisun@gmail.com" -> "j•••@gmail.com" (shown to whoever holds the device). */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "your email";
  return `${user[0]}\u2022\u2022\u2022@${domain}`;
}
