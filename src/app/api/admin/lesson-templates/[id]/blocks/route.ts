import { replaceAdminGlobalTemplateBlocks } from "@/lib/lesson-kit/admin-templates";
import { requireAdminSession } from "@/lib/admin-auth";
import { replaceLessonBlocksSchema } from "@/lib/lesson-kit/block-schema";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const parsed = replaceLessonBlocksSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid blocks payload" }, { status: 400 });
  }

  const kit = await replaceAdminGlobalTemplateBlocks(id, parsed.data.blocks);
  if (!kit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ kit });
}
