import { createParishForDre } from "@/lib/lesson-kit/parish-admin";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const result = await createParishForDre(session.familyAccountId, body.name ?? "");

  if ("error" in result) {
    const status =
      result.error === "already_member" ? 409 : result.error === "name_required" ? 400 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    parish: {
      id: result.parish.id,
      name: result.parish.name,
      inviteCode: result.parish.inviteCode,
    },
  });
}
