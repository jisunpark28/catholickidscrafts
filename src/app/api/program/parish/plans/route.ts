import { listParishPlans, upsertParishPlan } from "@/lib/lesson-kit/parish-admin";
import { requireDre, requireParishMember } from "@/lib/lesson-kit/parish-permissions";
import { weekStartSundayUtc } from "@/lib/lesson-kit/week";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const member = await requireParishMember(session.familyAccountId);
  if (!member) {
    return NextResponse.json({ plans: [] });
  }

  const plans = await listParishPlans(member.parishId);
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const dre = await requireDre(session.familyAccountId);
  if (!dre) {
    return NextResponse.json({ error: "DRE role required" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    weekStart?: string;
    title?: string;
    lessonKitId?: string | null;
    notes?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const plan = await upsertParishPlan({
    parishId: dre.parishId,
    weekStart: body.weekStart ?? weekStartSundayUtc(),
    title: body.title.trim(),
    lessonKitId: body.lessonKitId ?? null,
    notes: body.notes,
  });

  return NextResponse.json({ plan });
}
