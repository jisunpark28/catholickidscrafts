import { replaceLessonBlocks } from "@/lib/lesson-kit/db";
import type { LessonBlockConfig } from "@/lib/lesson-kit/types";
import { requireFamilySession } from "@/lib/family-auth";
import type { LessonBlockType } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    blocks?: {
      sortOrder: number;
      type: LessonBlockType;
      label?: string | null;
      config: LessonBlockConfig;
    }[];
  };

  if (!body.blocks || !Array.isArray(body.blocks)) {
    return NextResponse.json({ error: "blocks required" }, { status: 400 });
  }

  const kit = await replaceLessonBlocks(id, session.familyAccountId, body.blocks);
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}
