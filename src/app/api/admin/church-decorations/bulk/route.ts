import { requireAdminSession } from "@/lib/admin-auth";
import { getChurchWallSlot, isStandardWallSlot } from "@/lib/church-wall-slots";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";
import { z } from "zod";

const slotSchema = z.object({
  sortOrder: z.number().int().min(0).max(13),
  id: z.string().optional(),
  title: z.string().max(120).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  published: z.boolean().optional(),
});

const bulkSchema = z.object({
  slots: z.array(slotSchema).max(14),
});

function defaultTitle(sortOrder: number): string {
  const slot = getChurchWallSlot(sortOrder);
  if (!slot) return `Wall ${sortOrder}`;
  return `${slot.side === "left" ? "Left" : "Right"} wall ${slot.row + 1}`;
}

function slugForSlot(sortOrder: number, title: string): string {
  const base = slugify(title) || `wall-${sortOrder}`;
  return `wall-${sortOrder}-${base}`.slice(0, 80);
}

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  let removed = 0;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.churchDecoration.findMany({
      where: { sortOrder: { gte: 0, lte: 13 } },
    });
    const bySortOrder = new Map<number, (typeof existing)[number]>();
    for (const row of existing) {
      if (isStandardWallSlot(row.sortOrder) && !bySortOrder.has(row.sortOrder)) {
        bySortOrder.set(row.sortOrder, row);
      }
    }

    for (const input of parsed.data.slots) {
      if (!isStandardWallSlot(input.sortOrder)) continue;

      const wall = getChurchWallSlot(input.sortOrder)!;
      const imageUrl = input.imageUrl?.trim() ?? "";
      const prev = input.id
        ? await tx.churchDecoration.findUnique({ where: { id: input.id } })
        : bySortOrder.get(input.sortOrder);

      if (!imageUrl) {
        if (prev) {
          await tx.churchDecoration.delete({ where: { id: prev.id } });
          removed += 1;
          bySortOrder.delete(input.sortOrder);
        }
        continue;
      }

      const title = (input.title?.trim() || prev?.title || defaultTitle(input.sortOrder)).slice(
        0,
        120,
      );
      const data = {
        title,
        description: input.description?.trim() ?? prev?.description ?? "",
        imageUrl,
        posX: wall.x,
        posY: wall.y,
        posZ: wall.z,
        width: input.width ?? prev?.width ?? wall.width,
        height: input.height ?? prev?.height ?? wall.height,
        rotationY: wall.rotationY,
        sortOrder: input.sortOrder,
        published: input.published ?? prev?.published ?? true,
      };

      if (prev) {
        const slug = prev.slug || slugForSlot(input.sortOrder, title);
        await tx.churchDecoration.update({
          where: { id: prev.id },
          data: { ...data, slug },
        });
        updated += 1;
      } else {
        let slug = slugForSlot(input.sortOrder, title);
        if (await tx.churchDecoration.findUnique({ where: { slug } })) {
          slug = `wall-${input.sortOrder}-${Date.now()}`;
        }
        await tx.churchDecoration.create({ data: { ...data, slug } });
        created += 1;
      }
    }
  });

  return NextResponse.json({ created, updated, removed });
}
