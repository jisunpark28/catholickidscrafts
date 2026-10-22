import { getDeviceLock } from "@/lib/family-auth";
import {
  buildGoogleAuthUrl,
  GOOGLE_OAUTH_NONCE_COOKIE,
  GOOGLE_OAUTH_NONCE_MAX_AGE_SEC,
  createGoogleOAuthState,
  isGoogleSignInConfigured,
  type GoogleOAuthFrom,
} from "@/lib/google-oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isGoogleSignInConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const from: GoogleOAuthFrom = searchParams.get("from") === "signup" ? "signup" : "login";

  const locked = Boolean(await getDeviceLock());
  const { state, nonce } = await createGoogleOAuthState(from, locked);
  const url = buildGoogleAuthUrl(state, { nonce, locked });
  const res = NextResponse.redirect(url);
  // Binds this round trip to this browser; checked in the callback.
  res.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/family/google",
    maxAge: GOOGLE_OAUTH_NONCE_MAX_AGE_SEC,
  });
  return res;
}
