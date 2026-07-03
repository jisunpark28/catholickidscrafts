import { loadTeacherLessonStats } from "@/lib/lesson-kit/teacher-stats";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const stats = await loadTeacherLessonStats(session.familyAccountId);
  return NextResponse.json(stats);
}
