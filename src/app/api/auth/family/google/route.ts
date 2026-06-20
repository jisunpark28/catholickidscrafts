import {
  buildGoogleAuthUrl,
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

  const state = await createGoogleOAuthState(from);
  const url = buildGoogleAuthUrl(state);
  return NextResponse.redirect(url);
}
