import { SignJWT, jwtVerify } from "jose";

export const FAMILY_SESSION_COOKIE = "ckc_family";
export const READER_SESSION_COOKIE = "ckc_reader";
/**
 * Signed "this device was handed to a child" marker. Survives sign-out on purpose,
 * for at most 30 days after the last child sign-in on the device.
 */
export const DEVICE_LOCK_COOKIE = "ckc_device_lock";
export const DEVICE_LOCK_MAX_AGE_SEC = 60 * 60 * 24 * 30;

/** Parent sessions: 30 days, rolling (re-issued by refreshFamilySessionIfStale). */
export const FAMILY_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;
/** Hard limit for a parent session: 90 days after the sign-in, however active. */
export const FAMILY_SESSION_ABSOLUTE_MAX_SEC = 60 * 60 * 24 * 90;
/**
 * Child sessions (Kid Code + PIN reader cookie, and a parent cookie switched to child mode):
 * 7 days, not extended. Still validated against the DB on every use.
 */
export const KID_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
const SUB_READER_MAX_AGE_SEC = KID_SESSION_MAX_AGE_SEC;
/** Re-issue a parent session once it is older than this. */
export const FAMILY_SESSION_REFRESH_AFTER_SEC = 60 * 60 * 24;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required for family sessions");
  return new TextEncoder().encode(secret);
}

/**
 * Who is reading on this device, kept inside the signed parent cookie so deleting or
 * editing ckc_reader cannot turn a child back into the parent.
 * - "owner": the parent (only issued by a parent sign-in that passed the device-lock check)
 * - "sub": a child; subProfileId may be null when the child profile is unknown/removed
 */
export type FamilyReaderMode =
  | { type: "owner" }
  | { type: "sub"; subProfileId: string | null };

export type FamilySession = {
  familyAccountId: string;
  email: string;
  /** null only for tokens issued before reader mode existed (legacy). */
  readerMode: FamilyReaderMode | null;
  /** Must match FamilyAccount.sessionVersion; bumped by "sign out of all devices". */
  sessionVersion: number;
  /** Seconds since epoch (JWT iat). */
  issuedAt: number;
  /** Seconds since epoch of the sign-in this session started from (kept across refreshes). */
  authTime: number;
};

export type FamilySessionPayload = Omit<FamilySession, "issuedAt" | "readerMode" | "authTime"> & {
  readerMode: FamilyReaderMode;
  /** Original sign-in time; omit for a new sign-in (= now). */
  authTime?: number;
};

export type ReaderSession =
  | { type: "owner"; familyAccountId: string; sessionVersion: number; authTime?: number }
  | { type: "sub"; subProfileId: string; familyAccountId: string; sessionVersion: number };

function baseCookie(name: string, value: string, maxAge: number) {
  return {
    name,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function familyCookieOptions(token: string, maxAge = FAMILY_SESSION_MAX_AGE_SEC) {
  return baseCookie(FAMILY_SESSION_COOKIE, token, maxAge);
}

export function readerCookieOptions(token: string, type: ReaderSession["type"] = "owner") {
  return baseCookie(
    READER_SESSION_COOKIE,
    token,
    type === "sub" ? SUB_READER_MAX_AGE_SEC : FAMILY_SESSION_MAX_AGE_SEC,
  );
}

function readVersion(value: unknown): number {
  // Tokens issued before sessionVersion existed carry no "sv"; treat as 0 so
  // they stay valid until the account bumps its version.
  return typeof value === "number" && Number.isInteger(value) ? value : 0;
}

const nowSec = () => Math.floor(Date.now() / 1000);

/**
 * Expiry for a parent token: 30 days rolling, never past 90 days after the sign-in.
 * A parent cookie in child mode lasts 7 days and is not extended.
 */
export function familyTokenExpiry(input: { nowSec: number; authTime: number; childMode: boolean }): number {
  const rolling = input.nowSec + (input.childMode ? KID_SESSION_MAX_AGE_SEC : FAMILY_SESSION_MAX_AGE_SEC);
  return Math.min(rolling, input.authTime + FAMILY_SESSION_ABSOLUTE_MAX_SEC);
}

/** Server-side limits for a decoded parent token (also catches legacy tokens signed with longer exp). */
export function familySessionTimesValid(input: {
  nowSec: number;
  issuedAt: number;
  authTime: number;
  childMode: boolean;
}): boolean {
  const { nowSec: now, issuedAt, authTime } = input;
  if (issuedAt > now + 60 || authTime > now + 60 || authTime > issuedAt + 60) return false;
  if (now - issuedAt > FAMILY_SESSION_MAX_AGE_SEC) return false;
  if (now - authTime > FAMILY_SESSION_ABSOLUTE_MAX_SEC) return false;
  if (input.childMode && now - issuedAt > KID_SESSION_MAX_AGE_SEC) return false;
  return true;
}

export async function signFamilySession(payload: FamilySessionPayload): Promise<string> {
  const now = nowSec();
  const authTime = payload.authTime ?? now;
  return new SignJWT({
    familyAccountId: payload.familyAccountId,
    email: payload.email,
    sv: payload.sessionVersion,
    rm: payload.readerMode.type,
    ...(payload.readerMode.type === "sub" ? { rsub: payload.readerMode.subProfileId } : {}),
    at: authTime,
    kind: "family",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(familyTokenExpiry({ nowSec: now, authTime, childMode: payload.readerMode.type === "sub" }))
    .sign(secretKey());
}

export async function verifyFamilySession(token: string): Promise<FamilySession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "family") return null;
    const familyAccountId = payload.familyAccountId;
    const email = payload.email;
    if (typeof familyAccountId !== "string" || typeof email !== "string") return null;
    const issuedAt = typeof payload.iat === "number" ? payload.iat : 0;
    // Tokens from before the 90-day limit carry no "at": count from their own iat.
    const authTime = typeof payload.at === "number" ? payload.at : issuedAt;
    let readerMode: FamilyReaderMode | null = null;
    if (payload.rm === "owner") readerMode = { type: "owner" };
    else if (payload.rm === "sub") {
      readerMode = { type: "sub", subProfileId: typeof payload.rsub === "string" ? payload.rsub : null };
    } else if (payload.rm !== undefined) {
      // Unknown value: fail closed as a child.
      readerMode = { type: "sub", subProfileId: null };
    }
    // Enforced here too, so older tokens signed with a longer exp are cut off.
    if (!familySessionTimesValid({ nowSec: nowSec(), issuedAt, authTime, childMode: readerMode?.type === "sub" })) {
      return null;
    }
    return { familyAccountId, email, readerMode, sessionVersion: readVersion(payload.sv), issuedAt, authTime };
  } catch {
    return null;
  }
}

export async function signReaderSession(payload: ReaderSession): Promise<string> {
  const now = nowSec();
  if (payload.type === "sub") {
    const { sessionVersion, ...rest } = payload;
    return new SignJWT({ ...rest, sv: sessionVersion, kind: "reader" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + SUB_READER_MAX_AGE_SEC)
      .sign(secretKey());
  }
  // Owner reader follows the parent session: 30 days rolling, 90 days after sign-in at most.
  const authTime = payload.authTime ?? now;
  return new SignJWT({
    type: "owner",
    familyAccountId: payload.familyAccountId,
    sv: payload.sessionVersion,
    at: authTime,
    kind: "reader",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(familyTokenExpiry({ nowSec: now, authTime, childMode: false }))
    .sign(secretKey());
}

export async function verifyReaderSession(token: string): Promise<ReaderSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "reader") return null;
    const sessionVersion = readVersion(payload.sv);
    if (payload.type === "owner") {
      const familyAccountId = payload.familyAccountId;
      if (typeof familyAccountId !== "string") return null;
      const issuedAt = typeof payload.iat === "number" ? payload.iat : 0;
      const authTime = typeof payload.at === "number" ? payload.at : issuedAt;
      if (!familySessionTimesValid({ nowSec: nowSec(), issuedAt, authTime, childMode: false })) return null;
      return { type: "owner", familyAccountId, sessionVersion, authTime };
    }
    if (payload.type === "sub") {
      const subProfileId = payload.subProfileId;
      const familyAccountId = payload.familyAccountId;
      if (typeof subProfileId !== "string" || typeof familyAccountId !== "string") return null;
      // 7 days, also for older child tokens that were signed with a 1-year exp.
      const issuedAt = typeof payload.iat === "number" ? payload.iat : 0;
      const now = nowSec();
      if (issuedAt > now + 60 || now - issuedAt > SUB_READER_MAX_AGE_SEC) return null;
      return { type: "sub", subProfileId, familyAccountId, sessionVersion };
    }
    return null;
  } catch {
    return null;
  }
}

export type DeviceLock = {
  familyAccountId: string | null;
  subProfileId: string | null;
  /** Seconds since epoch when the device entered child mode. */
  lockedAt: number;
};

export async function signDeviceLock(lock: Omit<DeviceLock, "lockedAt">): Promise<string> {
  return new SignJWT({
    kind: "device-lock",
    fid: lock.familyAccountId,
    sid: lock.subProfileId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DEVICE_LOCK_MAX_AGE_SEC}s`)
    .sign(secretKey());
}

export async function verifyDeviceLock(token: string | undefined | null): Promise<DeviceLock | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "device-lock") return null;
    // 30 days, also for older markers that were signed with a 1-year exp.
    const lockedAt = typeof payload.iat === "number" ? payload.iat : 0;
    const now = nowSec();
    if (lockedAt > now + 60 || now - lockedAt > DEVICE_LOCK_MAX_AGE_SEC) return null;
    return {
      familyAccountId: typeof payload.fid === "string" ? payload.fid : null,
      subProfileId: typeof payload.sid === "string" ? payload.sid : null,
      lockedAt,
    };
  } catch {
    return null;
  }
}

export function deviceLockCookieOptions(token: string) {
  return baseCookie(DEVICE_LOCK_COOKIE, token, DEVICE_LOCK_MAX_AGE_SEC);
}
