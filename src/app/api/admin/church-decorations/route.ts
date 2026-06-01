import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  posZ: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  rotationY: z.number().optional(),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await prisma.churchDecoration.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.title);
  if (await prisma.churchDecoration.findUnique({ where: { slug } })) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const item = await prisma.churchDecoration.create({
    data: {
      slug,
      title: data.title,
      description: data.description ?? "",
      imageUrl: data.imageUrl,
      posX: data.posX ?? 0,
      posY: data.posY ?? 2.2,
      posZ: data.posZ ?? -6,
      width: data.width ?? 1.4,
      height: data.height ?? 1.4,
      rotationY: data.rotationY ?? 0,
      sortOrder: data.sortOrder ?? 0,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
