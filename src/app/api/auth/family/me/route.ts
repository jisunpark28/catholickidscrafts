import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({
    account: {
      id: session.familyAccountId,
      email: session.email,
      displayName: session.displayName,
    },
  });
}
