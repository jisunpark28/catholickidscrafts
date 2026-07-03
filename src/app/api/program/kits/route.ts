import {
  duplicateLessonKit,
  listGlobalTemplates,
  listParishKits,
  listPersonalKits,
  getParishMembership,
} from "@/lib/lesson-kit/db";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireFamilySession();
  const templates = await listGlobalTemplates();

  if (!session) {
    return NextResponse.json({ templates, personal: [], parish: [], signedIn: false });
  }

  const [personal, membership] = await Promise.all([
    listPersonalKits(session.familyAccountId),
    getParishMembership(session.familyAccountId),
  ]);

  const parish = membership ? await listParishKits(membership.parishId) : [];

  return NextResponse.json({
    templates,
    personal,
    parish,
    signedIn: true,
    parishInfo: membership
      ? { name: membership.parish.name, role: membership.role, parishId: membership.parishId }
      : null,
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
