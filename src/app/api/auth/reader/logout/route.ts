import { resetSessionOnResponse } from "@/lib/session-reset";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Reader sign-out (child or parent reader): same full reset as the parent sign-out. The parent
 * session, the child session and the child-mode device lock are all removed, so the next
 * Google sign-in is a normal grown-up sign-in. Removing cookies never signs anyone in.
 */
export async function POST() {
  const jar = await cookies();
  const res = NextResponse.json({ ok: true });
  resetSessionOnResponse(res, jar.getAll().map((c) => c.name));
  return res;
}
