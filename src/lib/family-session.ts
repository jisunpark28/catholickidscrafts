import { SignJWT, jwtVerify } from "jose";

export const FAMILY_SESSION_COOKIE = "ckc_family";
export const READER_SESSION_COOKIE = "ckc_reader";

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required for family sessions");
  return new TextEncoder().encode(secret);
}

export type FamilySession = {
  familyAccountId: string;
  email: string;
};

export type ReaderSession =
  | { type: "owner"; familyAccountId: string }
  | { type: "sub"; subProfileId: string; familyAccountId: string };

export function familyCookieOptions(token: string) {
  return {
    name: FAMILY_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SEC,
  };
}

export function readerCookieOptions(token: string) {
  return {
    name: READER_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SEC,
  };
}

export async function signFamilySession(payload: FamilySession): Promise<string> {
  return new SignJWT({ ...payload, kind: "family" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secretKey());
}

export async function verifyFamilySession(token: string): Promise<FamilySession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "family") return null;
    const familyAccountId = payload.familyAccountId;
    const email = payload.email;
    if (typeof familyAccountId !== "string" || typeof email !== "string") return null;
    return { familyAccountId, email };
  } catch {
    return null;
  }
}

export async function signReaderSession(payload: ReaderSession): Promise<string> {
  return new SignJWT({ ...payload, kind: "reader" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secretKey());
}

export async function verifyReaderSession(token: string): Promise<ReaderSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "reader") return null;
    if (payload.type === "owner") {
      const familyAccountId = payload.familyAccountId;
      if (typeof familyAccountId !== "string") return null;
      return { type: "owner", familyAccountId };
    }
    if (payload.type === "sub") {
      const subProfileId = payload.subProfileId;
      const familyAccountId = payload.familyAccountId;
      if (typeof subProfileId !== "string" || typeof familyAccountId !== "string") return null;
      return { type: "sub", subProfileId, familyAccountId };
    }
    return null;
  } catch {
    return null;
  }
}
