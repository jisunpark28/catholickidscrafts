import {
  buildGoogleAuthUrl,
  createGoogleOAuthState,
  isGoogleSignInConfigured,
} from "@/lib/google-oauth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isGoogleSignInConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const state = await createGoogleOAuthState();
  const url = buildGoogleAuthUrl(state);
  return NextResponse.redirect(url);
}
