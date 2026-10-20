import { SignJWT, jwtVerify } from "jose";

export const FAMILY_SESSION_COOKIE = "ckc_family";
export const READER_SESSION_COOKIE = "ckc_reader";

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

export type FamilySession = {
  familyAccountId: string;
  email: string;
  /** Must match FamilyAccount.sessionVersion; bumped by "sign out of all devices". */
  sessionVersion: number;
  /** Seconds since epoch (JWT iat). */
  issuedAt: number;
};

export type FamilySessionPayload = Omit<FamilySession, "issuedAt">;

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
    return { familyAccountId, email, sessionVersion: readVersion(payload.sv), issuedAt };
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
