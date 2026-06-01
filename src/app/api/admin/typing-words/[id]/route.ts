import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  word: z.string().min(1).max(64).optional(),
  hint: z.string().max(200).optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const item = await prisma.typingWord.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const item = await prisma.typingWord.update({
    where: { id },
    data: {
      ...(data.word !== undefined ? { word: data.word.trim() } : {}),
      ...(data.hint !== undefined ? { hint: data.hint.trim() } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  await prisma.typingWord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
