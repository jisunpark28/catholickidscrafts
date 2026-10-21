import { requireAdminSession } from "@/lib/admin-auth";
import { qaBulkStatusSchema, readJson } from "@/lib/liturgy-qa-admin";
import { isQaTopic } from "@/lib/liturgy-qa-topics";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

/** Bulk publish or unpublish every card in one topic. */
export async function POST(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { slug } = await params;
  if (!isQaTopic(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = qaBulkStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const result = await prisma.liturgyQaCard.updateMany({
    where: { topicSlug: slug },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true, count: result.count });
}
