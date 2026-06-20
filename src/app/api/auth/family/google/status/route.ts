import { isGoogleSignInConfigured } from "@/lib/google-oauth";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    enabled: isGoogleSignInConfigured(),
  });
}
