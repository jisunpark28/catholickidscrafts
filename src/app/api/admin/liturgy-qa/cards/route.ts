import { requireAdminSession } from "@/lib/admin-auth";
import { qaCardCreateSchema, readJson } from "@/lib/liturgy-qa-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await readJson(request);
  const parsed = qaCardCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { topicSlug, imageUrl, ...rest } = parsed.data;

  const topic = await prisma.liturgyQaTopic.findUnique({ where: { slug: topicSlug } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not set up yet. Run the liturgy Q&A seed first." }, { status: 400 });
  }
  const last = await prisma.liturgyQaCard.aggregate({ where: { topicSlug }, _max: { sortOrder: true } });

  const item = await prisma.liturgyQaCard.create({
    data: {
      ...rest,
      topicSlug,
      imageUrl: imageUrl || null,
      sortOrder: (last._max.sortOrder ?? 0) + 1,
      adminEditedAt: new Date(),
    },
  });
  return NextResponse.json({ id: item.id, topicSlug: item.topicSlug }, { status: 201 });
}
