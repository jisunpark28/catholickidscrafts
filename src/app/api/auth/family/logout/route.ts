import { resetSessionOnResponse } from "@/lib/session-reset";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Sign out: ends every session on this device and resets it (child-mode lock included). */
export async function POST() {
  const jar = await cookies();
  const res = NextResponse.json({ ok: true });
  resetSessionOnResponse(res, jar.getAll().map((c) => c.name));
  return res;
}
