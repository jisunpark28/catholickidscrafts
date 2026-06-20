import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const itemSchema = z.object({
  sectionId: z.string().min(1),
  title: z.string().min(1),
  href: z.string().min(1),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const body = await request.json();
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const item = await prisma.homeSectionItem.create({
    data: {
      sectionId: parsed.data.sectionId,
      title: parsed.data.title,
      href: parsed.data.href,
      sortOrder: parsed.data.sortOrder ?? 0,
      published: parsed.data.published ?? true,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
