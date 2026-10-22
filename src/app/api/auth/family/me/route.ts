import { parentApiGuard } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;
  return NextResponse.json({
    account: {
      id: session.familyAccountId,
      email: session.email,
      displayName: session.displayName,
    },
  });
}
