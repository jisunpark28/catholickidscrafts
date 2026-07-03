import { replaceLessonBlocksSchema } from "@/lib/lesson-kit/block-schema";
import { replaceLessonBlocks } from "@/lib/lesson-kit/db";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await params;
  const raw = await req.json().catch(() => ({}));
  const parsed = replaceLessonBlocksSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid blocks payload" }, { status: 400 });
  }

  const kit = await replaceLessonBlocks(id, session.familyAccountId, parsed.data.blocks);
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}
