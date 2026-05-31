import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";
import { z } from "zod";

const resourceSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string(),
  content: z.string(),
  grade: z.string(),
  topic: z.string(),
  liturgicalPeriod: z.string(),
  downloadLabel: z.string().optional().nullable(),
  downloadUrl: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await prisma.resource.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = resourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.title);
  const existing = await prisma.resource.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const item = await prisma.resource.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      grade: data.grade,
      topic: data.topic,
      liturgicalPeriod: data.liturgicalPeriod,
      downloadLabel: data.downloadLabel ?? null,
      downloadUrl: data.downloadUrl ?? null,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
