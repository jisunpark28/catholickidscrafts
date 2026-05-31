import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";
import { z } from "zod";

const trackSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  stage: z.string(),
  description: z.string(),
  body: z.string().optional(),
  lessonCount: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await prisma.curriculumTrack.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.title);
  const existing = await prisma.curriculumTrack.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const item = await prisma.curriculumTrack.create({
    data: {
      slug,
      title: data.title,
      stage: data.stage,
      description: data.description,
      body: data.body ?? "",
      lessonCount: data.lessonCount ?? 0,
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
