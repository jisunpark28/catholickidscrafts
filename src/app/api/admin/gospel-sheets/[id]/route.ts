import { requireAdminSession } from "@/lib/admin-auth";
import { gospelSheetSchema, sheetCreateData } from "@/lib/gospel-sheet";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;

  const parsed = gospelSheetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid input" },
      { status: 400 },
    );
  }
  const existing = await prisma.gospelSheet.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const data = sheetCreateData(parsed.data);
    const sheet = await prisma.$transaction(async (tx) => {
      if (data.featured) {
        await tx.gospelSheet.updateMany({ where: { featured: true, NOT: { id } }, data: { featured: false } });
      }
      return tx.gospelSheet.update({ where: { id }, data });
    });
    return NextResponse.json(sheet);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "A sheet for that Sunday already exists" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.gospelSheet.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.gospelSheet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
