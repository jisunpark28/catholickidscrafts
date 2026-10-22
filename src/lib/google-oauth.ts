import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

/** HttpOnly cookie that binds an OAuth round trip to this browser (holds the state nonce). */
export const GOOGLE_OAUTH_NONCE_COOKIE = "ckc_oauth_nonce";
export const GOOGLE_OAUTH_NONCE_MAX_AGE_SEC = 10 * 60;
/** A sign-in on a locked device must be this recent (ID token auth_time). */
export const GOOGLE_FRESH_AUTH_MAX_AGE_SEC = 5 * 60;

function authSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required for Google sign-in");
  return new TextEncoder().encode(secret);
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function getGoogleOAuthClientId(): string | null {
  return process.env.GOOGLE_CLIENT_ID?.trim() || null;
}

export function getGoogleRedirectUri(): string {
  const authUrl = process.env.AUTH_URL?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  // Local dev: AUTH_URL wins so production NEXT_PUBLIC_SITE_URL does not break OAuth.
  const base = (
    process.env.NODE_ENV === "development" && authUrl
      ? authUrl
      : siteUrl || authUrl || "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}/api/auth/family/google/callback`;
}

export type GoogleOAuthFrom = "signup" | "login";

export type GoogleOAuthState = { from: GoogleOAuthFrom; nonce: string; locked: boolean };

export async function createGoogleOAuthState(
  from: GoogleOAuthFrom = "login",
  locked = false,
): Promise<{ state: string; nonce: string }> {
  const nonce = randomUUID();
  const state = await new SignJWT({ nonce, from, locked })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecret());
  return { state, nonce };
}

export async function verifyGoogleOAuthState(state: string): Promise<GoogleOAuthState | null> {
  try {
    const { payload } = await jwtVerify(state, authSecret());
    if (typeof payload.nonce !== "string") return null;
    return {
      from: payload.from === "signup" ? "signup" : "login",
      nonce: payload.nonce,
      locked: payload.locked === true,
    };
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(
  state: string,
  opts: { nonce: string; locked?: boolean },
): string {
  const clientId = getGoogleOAuthClientId();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
    nonce: opts.nonce,
  });
  if (opts.locked) {
    // Google does not support prompt=login and may ignore max_age; we still ask, and the
    // callback enforces auth_time from the verified ID token.
    params.set("max_age", "0");
    params.set("claims", JSON.stringify({ id_token: { auth_time: { essential: true } } }));
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleIdTokenClaims = {
  sub: string;
  nonce: string | null;
  /** Seconds since epoch of the user's last Google authentication, when provided. */
  authTime: number | null;
};

export type GoogleUserProfile = {
  googleId: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  /** Verified ID token claims (signature, iss, aud, exp checked), or null if missing/invalid. */
  idToken: GoogleIdTokenClaims | null;
};

async function verifyGoogleIdToken(idToken: string | undefined, clientId: string) {
  if (!idToken) return null;
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience: clientId,
    });
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      nonce: typeof payload.nonce === "string" ? payload.nonce : null,
      authTime: typeof payload.auth_time === "number" ? payload.auth_time : null,
    } satisfies GoogleIdTokenClaims;
  } catch (e) {
    console.error("google id_token verification failed", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function fetchGoogleUserProfile(code: string): Promise<GoogleUserProfile> {
  const clientId = getGoogleOAuthClientId();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured");
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "");
    throw new Error(`Google token exchange failed (${tokenRes.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const tokenText = await tokenRes.text();
  let tokenData: { access_token?: string; id_token?: string };
  try {
    tokenData = tokenText ? (JSON.parse(tokenText) as { access_token?: string; id_token?: string }) : {};
  } catch {
    throw new Error("Google token response was not valid JSON");
  }
  if (!tokenData.access_token) {
    throw new Error("Google token response missing access_token");
  }

  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error(`Google userinfo failed (${userRes.status})`);
  }

  const userText = await userRes.text();
  let user: {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  try {
    user = userText ? (JSON.parse(userText) as typeof user) : {};
  } catch {
    throw new Error("Google userinfo response was not valid JSON");
  }

  if (!user.sub || !user.email) {
    throw new Error("Google profile missing sub or email");
  }
  if (!user.email_verified) {
    throw new Error("Google email is not verified");
  }

  const idToken = await verifyGoogleIdToken(tokenData.id_token, clientId);

  return {
    googleId: user.sub,
    email: user.email.toLowerCase(),
    name: user.name?.trim() || null,
    emailVerified: true,
    idToken,
  };
}
