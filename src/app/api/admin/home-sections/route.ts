import { requireAdminSession } from "@/lib/admin-auth";
import { getAllHomeSectionsForAdmin } from "@/lib/home-sections";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const sectionSchema = z.object({
  title: z.string().min(1),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const sections = await getAllHomeSectionsForAdmin();
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const body = await request.json();
  const parsed = sectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const section = await prisma.homeSection.create({
    data: {
      title: parsed.data.title,
      sortOrder: parsed.data.sortOrder ?? 0,
      published: parsed.data.published ?? true,
    },
  });
  return NextResponse.json(section, { status: 201 });
}
