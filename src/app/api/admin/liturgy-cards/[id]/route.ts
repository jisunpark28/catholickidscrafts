import { requireAdminSession } from "@/lib/admin-auth";
import { isLiturgyCardLink, isLiturgyTopic } from "@/lib/liturgy-topics";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  topic: z.string().refine(isLiturgyTopic, "Unknown topic").optional(),
  title: z.string().trim().max(120).optional(),
  href: z.string().trim().refine(isLiturgyCardLink, "Use a site path or an http(s) URL").optional(),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isLiturgyCardLink(value), "Image must be a site path or an http(s) URL")
    .optional(),
  sortOrder: z.number().int().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const item = await prisma.liturgyCard.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.liturgyCard.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;
  const item = await prisma.liturgyCard.update({
    where: { id },
    data: {
      topic: data.topic,
      title: data.title,
      href: data.href?.trim(),
      imageUrl: data.imageUrl?.trim(),
      sortOrder: data.sortOrder,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.liturgyCard.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.liturgyCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
