import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/weekly-content";
import { itemsCreateData, weeklyIssueSchema } from "@/lib/weekly-schema";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

/** Replaces the issue fields and its full item list (order = array order). */
export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const parsed = weeklyIssueSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const sundayDate = parseDateInput(data.sundayDate);
  if (!sundayDate) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const existing = await prisma.weeklyIssue.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const [, issue] = await prisma.$transaction([
      prisma.weeklyItem.deleteMany({ where: { issueId: id } }),
      prisma.weeklyIssue.update({
        where: { id },
        data: {
          sundayDate,
          title: data.title,
          season: data.season,
          cycle: data.cycle,
          gospelRef: data.gospelRef,
          color: data.color,
          published: data.published,
          items: { create: itemsCreateData(data.items) },
        },
      }),
    ]);
    return NextResponse.json(issue);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "An issue for that Sunday already exists" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.weeklyIssue.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.weeklyIssue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}