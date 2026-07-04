import { deletePersonalLessonKit, getLessonKitById, updateLessonKitMeta } from "@/lib/lesson-kit/db";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await params;
  const kit = await getLessonKitById(id);
  if (!kit || kit.familyAccountId !== session.familyAccountId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    published?: boolean;
    communityVisible?: boolean;
    authorDisplayName?: string | null;
    familyMode?: import("@/lib/lesson-kit/types").FamilyModeConfig;
    tptUrl?: string | null;
    isFreeSample?: boolean;
    gradeBand?: string | null;
    liturgicalPeriod?: string | null;
    sortOrder?: number;
  };

  const kit = await updateLessonKitMeta(id, session.familyAccountId, body);
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deletePersonalLessonKit(id, session.familyAccountId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
