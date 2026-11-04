import { KID_LOGIN_RETIRED } from "@/lib/kids/kid-login-copy";
import { NextResponse } from "next/server";

/** Retired in Mom's Bible PR-2: children sign in with Kid Code + PIN (POST /api/auth/kid/login). */
export async function POST() {
  return NextResponse.json({ error: KID_LOGIN_RETIRED }, { status: 410 });
}
