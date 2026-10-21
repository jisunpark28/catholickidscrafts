import { requireAdminSession } from "@/lib/admin-auth";
import { ID_RE, qaCardUpdateSchema, readJson } from "@/lib/liturgy-qa-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  if (!ID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = qaCardUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const existing = await prisma.liturgyQaCard.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { imageUrl, ...rest } = parsed.data;
  const item = await prisma.liturgyQaCard.update({
    where: { id },
    data: {
      ...rest,
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
      adminEditedAt: new Date(),
    },
    select: { id: true, topicSlug: true, status: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  if (!ID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const existing = await prisma.liturgyQaCard.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.liturgyQaCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
