import { SignJWT, jwtVerify } from "jose";

export const FAMILY_SESSION_COOKIE = "ckc_family";
export const READER_SESSION_COOKIE = "ckc_reader";
/** Signed "this device was handed to a child" marker. Survives sign-out on purpose. */
export const DEVICE_LOCK_COOKIE = "ckc_device_lock";
const DEVICE_LOCK_MAX_AGE_SEC = 60 * 60 * 24 * 365;

/** Parent sessions: 30 days, rolling (re-issued by refreshFamilySessionIfStale). */
export const FAMILY_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;
/** Child (Access ID) reader sessions stay long-lived but are validated against the DB on every use. */
const SUB_READER_MAX_AGE_SEC = 60 * 60 * 24 * 365;
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
};

export type FamilySessionPayload = Omit<FamilySession, "issuedAt" | "readerMode"> & {
  readerMode: FamilyReaderMode;
};

export type ReaderSession =
  | { type: "owner"; familyAccountId: string; sessionVersion: number }
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

export function familyCookieOptions(token: string) {
  return baseCookie(FAMILY_SESSION_COOKIE, token, FAMILY_SESSION_MAX_AGE_SEC);
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

export async function signFamilySession(payload: FamilySessionPayload): Promise<string> {
  return new SignJWT({
    familyAccountId: payload.familyAccountId,
    email: payload.email,
    sv: payload.sessionVersion,
    rm: payload.readerMode.type,
    ...(payload.readerMode.type === "sub" ? { rsub: payload.readerMode.subProfileId } : {}),
    kind: "family",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${FAMILY_SESSION_MAX_AGE_SEC}s`)
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
    // Enforce the 30-day limit even for older tokens that were signed with a 365d exp.
    if (Date.now() / 1000 - issuedAt > FAMILY_SESSION_MAX_AGE_SEC) return null;
    let readerMode: FamilyReaderMode | null = null;
    if (payload.rm === "owner") readerMode = { type: "owner" };
    else if (payload.rm === "sub") {
      readerMode = { type: "sub", subProfileId: typeof payload.rsub === "string" ? payload.rsub : null };
    } else if (payload.rm !== undefined) {
      // Unknown value: fail closed as a child.
      readerMode = { type: "sub", subProfileId: null };
    }
    return { familyAccountId, email, readerMode, sessionVersion: readVersion(payload.sv), issuedAt };
  } catch {
    return null;
  }
}

export async function signReaderSession(payload: ReaderSession): Promise<string> {
  const { sessionVersion, ...rest } = payload;
  const maxAge = payload.type === "sub" ? SUB_READER_MAX_AGE_SEC : FAMILY_SESSION_MAX_AGE_SEC;
  return new SignJWT({ ...rest, sv: sessionVersion, kind: "reader" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
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
      if (Date.now() / 1000 - issuedAt > FAMILY_SESSION_MAX_AGE_SEC) return null;
      return { type: "owner", familyAccountId, sessionVersion };
    }
    if (payload.type === "sub") {
      const subProfileId = payload.subProfileId;
      const familyAccountId = payload.familyAccountId;
      if (typeof subProfileId !== "string" || typeof familyAccountId !== "string") return null;
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
    return {
      familyAccountId: typeof payload.fid === "string" ? payload.fid : null,
      subProfileId: typeof payload.sid === "string" ? payload.sid : null,
      lockedAt: typeof payload.iat === "number" ? payload.iat : 0,
    };
  } catch {
    return null;
  }
}

export function deviceLockCookieOptions(token: string) {
  return baseCookie(DEVICE_LOCK_COOKIE, token, DEVICE_LOCK_MAX_AGE_SEC);
}
