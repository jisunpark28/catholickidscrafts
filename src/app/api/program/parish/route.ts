import { listParishPlans } from "@/lib/lesson-kit/parish-admin";
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

  const [kits, memberCount, plans] = await Promise.all([
    prisma.lessonKit.findMany({
      where: { parishId: membership.parishId },
      include: { opens: { orderBy: { dateKey: "desc" }, take: 14 } },
    }),
    prisma.parishMember.count({ where: { parishId: membership.parishId } }),
    listParishPlans(membership.parishId),
  ]);

  const weekOpens = kits.reduce((sum, k) => sum + k.opens.reduce((s, o) => s + o.opens, 0), 0);

  return NextResponse.json({
    parish: {
      id: membership.parish.id,
      name: membership.parish.name,
      role: membership.role,
      inviteCode: membership.role === "DRE" ? membership.parish.inviteCode : undefined,
      memberCount,
      weekOpens,
      kits: kits.map((k) => ({
        id: k.id,
        title: k.title,
        shareSlug: k.shareSlug,
        published: k.published,
        opens: k.opens.reduce((s, o) => s + o.opens, 0),
      })),
      plans: plans.map((p) => ({
        id: p.id,
        weekStart: p.weekStart,
        title: p.title,
        notes: p.notes,
        lessonKit: p.lessonKit,
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
