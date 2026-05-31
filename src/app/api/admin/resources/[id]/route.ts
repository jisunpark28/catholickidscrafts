import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  contentFormat: z.string().optional(),
  grade: z.string().optional(),
  topic: z.string().optional(),
  liturgicalPeriod: z.string().optional(),
  downloadLabel: z.string().optional().nullable(),
  downloadUrl: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.slug) {
    const conflict = await prisma.resource.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const item = await prisma.resource.update({
    where: { id },
    data: {
      ...data,
      slug: data.slug ?? (data.title ? slugify(data.title) : undefined),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  await prisma.resource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
