import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

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
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}/api/auth/family/google/callback`;
}

export async function createGoogleOAuthState(): Promise<string> {
  return new SignJWT({ nonce: randomUUID() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(authSecret());
}

export async function verifyGoogleOAuthState(state: string): Promise<boolean> {
  try {
    await jwtVerify(state, authSecret());
    return true;
  } catch {
    return false;
  }
}

export function buildGoogleAuthUrl(state: string): string {
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
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleUserProfile = {
  googleId: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
};

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
    throw new Error(`Google token exchange failed (${tokenRes.status})`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error("Google token response missing access_token");
  }

  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error(`Google userinfo failed (${userRes.status})`);
  }

  const user = (await userRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!user.sub || !user.email) {
    throw new Error("Google profile missing sub or email");
  }
  if (!user.email_verified) {
    throw new Error("Google email is not verified");
  }

  return {
    googleId: user.sub,
    email: user.email.toLowerCase(),
    name: user.name?.trim() || null,
    emailVerified: true,
  };
}
