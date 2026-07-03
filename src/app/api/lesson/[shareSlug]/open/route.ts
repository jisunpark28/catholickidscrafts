import { recordLessonOpen } from "@/lib/lesson-kit/db";
import { prisma } from "@/lib/prisma";
import { todayUniversalis, toDateKey } from "@/lib/dates";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ shareSlug: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { shareSlug } = await params;
  const kit = await prisma.lessonKit.findUnique({ where: { shareSlug } });
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const dateKey = toDateKey(todayUniversalis());
  await recordLessonOpen(kit.id, dateKey);
  return NextResponse.json({ ok: true });
}
