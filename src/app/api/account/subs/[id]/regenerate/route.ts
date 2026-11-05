import { parentApiGuard } from "@/lib/family-auth";
import { KID_CODE_TAKEN_ERROR, resolveNewKidCode } from "@/lib/kids/kid-code";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

/**
 * "New Kid Code" for one child: the child's name letters ("lily"), or a letters-only code the
 * parent types (body.kidCode) when the name gives none, it is taken, or it is already this
 * child's code. The PIN stays the same (it is hashed with the child id, not the code). The old
 * code stops working at once, so the child's tile on a device has to be added again.
 */
export async function POST(request: Request, { params }: Params) {
  const originError = crossOriginError(request);
  if (originError) return originError;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;

  const { id } = await params;
  const existing = await prisma.subProfile.findFirst({
    where: { id, familyAccountId: session.familyAccountId },
    select: { id: true, displayName: true, kidCode: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let body: { kidCode?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // No body: use the child's name.
  }

  const picked = await resolveNewKidCode(
    existing.displayName,
    typeof body.kidCode === "string" ? body.kidCode.slice(0, 40) : null,
    async (code) =>
      code === existing.kidCode ||
      Boolean(await prisma.subProfile.findUnique({ where: { kidCode: code }, select: { id: true } })),
  );
  if (!picked.ok) {
    return NextResponse.json({ error: picked.error, needsKidCode: true }, { status: 409 });
  }

  try {
    const sub = await prisma.subProfile.update({
      where: { id },
      data: { kidCode: picked.code },
      select: { id: true, displayName: true, kidCode: true },
    });
    return NextResponse.json({ sub, kidCode: sub.kidCode });
  } catch (e) {
    // Another child took the same code a moment ago.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: KID_CODE_TAKEN_ERROR, needsKidCode: true }, { status: 409 });
    }
    throw e;
  }
}
