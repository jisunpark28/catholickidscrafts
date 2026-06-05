import { requireAdminSession } from "@/lib/admin-auth";
import { invalidateSiteCopyCache } from "@/lib/site-copy";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const itemSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1).max(120),
  value: z.string().max(50000),
  group: z.string().min(1).max(64),
  hint: z.string().max(300).optional(),
  format: z.enum(["plain", "markdown"]).optional(),
  published: z.boolean().optional(),
});

const bulkSchema = z.object({
  items: z.array(itemSchema).min(1).max(500),
});

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");

  const items = await prisma.siteCopy.findMany({
    where: group ? { group } : undefined,
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });
  return NextResponse.json(items);
}

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    for (const item of parsed.data.items) {
      await tx.siteCopy.upsert({
        where: { key: item.key },
        update: {
          value: item.value,
          group: item.group,
          hint: item.hint ?? null,
          format: item.format ?? "plain",
          published: item.published ?? true,
        },
        create: {
          key: item.key,
          value: item.value,
          group: item.group,
          hint: item.hint ?? null,
          format: item.format ?? "plain",
          published: item.published ?? true,
        },
      });
    }
  });

  invalidateSiteCopyCache();
  return NextResponse.json({ saved: parsed.data.items.length });
}
