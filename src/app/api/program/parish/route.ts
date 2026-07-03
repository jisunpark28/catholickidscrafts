import { joinParishByInviteCode, getParishMembership } from "@/lib/lesson-kit/db";
import { requireFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const membership = await getParishMembership(session.familyAccountId);
  if (!membership) {
    return NextResponse.json({ parish: null });
  }

  const kits = await prisma.lessonKit.findMany({
    where: { parishId: membership.parishId },
    include: { opens: { orderBy: { dateKey: "desc" }, take: 14 } },
  });

  const weekOpens = kits.reduce((sum, k) => sum + k.opens.reduce((s, o) => s + o.opens, 0), 0);

  return NextResponse.json({
    parish: {
      id: membership.parish.id,
      name: membership.parish.name,
      role: membership.role,
      weekOpens,
      kits: kits.map((k) => ({
        id: k.id,
        title: k.title,
        shareSlug: k.shareSlug,
        opens: k.opens.reduce((s, o) => s + o.opens, 0),
      })),
    },
  });
}

export async function POST(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { inviteCode?: string };
  if (!body.inviteCode?.trim()) {
    return NextResponse.json({ error: "inviteCode required" }, { status: 400 });
  }
  const parish = await joinParishByInviteCode(session.familyAccountId, body.inviteCode);
  if (!parish) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }
  return NextResponse.json({ parish: { id: parish.id, name: parish.name } });
}
