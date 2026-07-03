import {
  createFamilyAssignment,
  listAssignableKits,
  listFamilyAssignments,
} from "@/lib/lesson-kit/assignments";
import { weekStartSundayUtc } from "@/lib/lesson-kit/week";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart") ?? weekStartSundayUtc();

  const [assignments, assignableKits] = await Promise.all([
    listFamilyAssignments(session.familyAccountId, weekStart),
    listAssignableKits(session.familyAccountId),
  ]);

  return NextResponse.json({ assignments, assignableKits, weekStart });
}

export async function POST(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    lessonKitId?: string;
    subProfileId?: string | null;
    weekStart?: string;
    note?: string;
  };

  if (!body.lessonKitId) {
    return NextResponse.json({ error: "lessonKitId required" }, { status: 400 });
  }

  const assignment = await createFamilyAssignment({
    familyAccountId: session.familyAccountId,
    lessonKitId: body.lessonKitId,
    subProfileId: body.subProfileId,
    weekStart: body.weekStart,
    note: body.note,
  });

  if (!assignment) {
    return NextResponse.json({ error: "Could not assign" }, { status: 400 });
  }

  return NextResponse.json({ assignment });
}
