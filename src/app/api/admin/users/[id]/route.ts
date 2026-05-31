import { requireSuperAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { session, error } = await requireSuperAdminSession();
  if (error) return error;

  const { id } = await params;
  if (id === session!.user!.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const count = await prisma.adminUser.count();
  if (count <= 1) {
    return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
