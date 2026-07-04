import { canDuplicateLessonKitSource } from "@/lib/lesson-kit/community";
import {
  duplicateLessonKit,
  listGlobalTemplates,
  listPersonalKits,
} from "@/lib/lesson-kit/db";
import { getTeacherSundayPin } from "@/lib/lesson-kit/sunday-pin";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireFamilySession();
  const templates = await listGlobalTemplates();

  if (!session) {
    return NextResponse.json({ templates, personal: [], signedIn: false, sundayPin: null });
  }

  const personal = await listPersonalKits(session.familyAccountId);
  const sundayPin = await getTeacherSundayPin(session.familyAccountId);

  return NextResponse.json({
    templates,
    personal,
    signedIn: true,
    sundayPin,
  });
}

export async function POST(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { sourceId?: string };
  if (!body.sourceId) {
    return NextResponse.json({ error: "sourceId required" }, { status: 400 });
  }

  const allowed = await canDuplicateLessonKitSource(body.sourceId, session.familyAccountId);
  if (!allowed) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  const kit = await duplicateLessonKit({
    sourceId: body.sourceId,
    familyAccountId: session.familyAccountId,
    scope: "PERSONAL",
    titleSuffix: " (copy)",
  });

  if (!kit) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({ kit });
}
