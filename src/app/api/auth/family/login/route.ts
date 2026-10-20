import { GOOGLE_ONLY_MESSAGE } from "@/lib/family-auth";
import { NextResponse } from "next/server";

/** Parent accounts are Google-only; email+password sign-in is retired. */
export async function POST() {
  return NextResponse.json(
    { error: GOOGLE_ONLY_MESSAGE, code: "GOOGLE_ONLY" },
    { status: 410 },
  );
}
