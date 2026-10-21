import { requireAdminSession } from "@/lib/admin-auth";
import { gospelSheetSchema, sheetCreateData } from "@/lib/gospel-sheet";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const parsed = gospelSheetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid input" },
      { status: 400 },
    );
  }
  try {
    const data = sheetCreateData(parsed.data);
    const sheet = await prisma.$transaction(async (tx) => {
      if (data.featured) await tx.gospelSheet.updateMany({ where: { featured: true }, data: { featured: false } });
      return tx.gospelSheet.create({ data });
    });
    return NextResponse.json(sheet);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "A sheet for that Sunday already exists" }, { status: 409 });
    }
    throw e;
  }
}
