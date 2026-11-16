import { getDeviceLock } from "@/lib/family-auth";
import {
  buildGoogleAuthUrl,
  GOOGLE_OAUTH_NONCE_COOKIE,
  GOOGLE_OAUTH_NONCE_MAX_AGE_SEC,
  GOOGLE_OAUTH_NONCE_PATH,
  createGoogleOAuthState,
  isGoogleSignInConfigured,
  type GoogleOAuthFrom,
} from "@/lib/google-oauth";
import { CALLBACK_PARAM, safeCallbackPath } from "@/lib/sign-in-callback";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isGoogleSignInConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const from: GoogleOAuthFrom = searchParams.get("from") === "signup" ? "signup" : "login";

  const locked = Boolean(await getDeviceLock());
  // Same-site return path only (e.g. the sheet page whose Print button sent them here).
  const next = safeCallbackPath(searchParams.get(CALLBACK_PARAM));
  const { state, nonce } = await createGoogleOAuthState(from, locked, next);
  const url = buildGoogleAuthUrl(state, { nonce, locked });
  const res = NextResponse.redirect(url);
  // Binds this round trip to this browser; checked in the callback.
  res.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: GOOGLE_OAUTH_NONCE_PATH,
    maxAge: GOOGLE_OAUTH_NONCE_MAX_AGE_SEC,
  });
  return res;
}
