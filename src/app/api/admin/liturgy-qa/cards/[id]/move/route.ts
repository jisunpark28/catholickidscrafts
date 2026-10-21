import { requireAdminSession } from "@/lib/admin-auth";
import { ID_RE, qaMoveSchema, readJson } from "@/lib/liturgy-qa-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

/** Swap sortOrder with the neighbour card (unique topic+sortOrder needs a temp slot). */
export async function POST(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  if (!ID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = qaMoveSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const card = await prisma.liturgyQaCard.findUnique({ where: { id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const up = parsed.data.direction === "up";
  const neighbour = await prisma.liturgyQaCard.findFirst({
    where: { topicSlug: card.topicSlug, sortOrder: up ? { lt: card.sortOrder } : { gt: card.sortOrder } },
    orderBy: { sortOrder: up ? "desc" : "asc" },
  });
  if (!neighbour) return NextResponse.json({ ok: true });

  await prisma.$transaction([
    prisma.liturgyQaCard.update({ where: { id: card.id }, data: { sortOrder: -1 } }),
    prisma.liturgyQaCard.update({ where: { id: neighbour.id }, data: { sortOrder: card.sortOrder } }),
    prisma.liturgyQaCard.update({
      where: { id: card.id },
      data: { sortOrder: neighbour.sortOrder, adminEditedAt: new Date() },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
