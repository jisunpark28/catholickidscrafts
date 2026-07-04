import { listCommunityLessonKits } from "@/lib/lesson-kit/community";
import { NextResponse } from "next/server";

export async function GET() {
  const kits = await listCommunityLessonKits();
  return NextResponse.json({ kits });
}
