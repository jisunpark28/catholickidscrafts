import { requireAdminSession } from "@/lib/admin-auth";
import { qaTopicUpdateSchema, readJson } from "@/lib/liturgy-qa-admin";
import { isQaTopic } from "@/lib/liturgy-qa-topics";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { slug } = await params;
  if (!isQaTopic(slug)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = qaTopicUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const existing = await prisma.liturgyQaTopic.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.liturgyQaTopic.update({ where: { slug }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
