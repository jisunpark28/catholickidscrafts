import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const item = await prisma.homeSectionItem.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  await prisma.homeSectionItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
