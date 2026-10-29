import { parentApiGuard } from "@/lib/family-auth";
import { familyHasPlus } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Editor re-checks Plus on the server right before PNG/PDF export. */
export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const isPlus = await familyHasPlus(guard.session.familyAccountId);
  return NextResponse.json({ isPlus }, { headers: { "Cache-Control": "no-store" } });
}
