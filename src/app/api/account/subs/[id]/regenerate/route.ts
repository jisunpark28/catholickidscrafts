import { parentApiGuard } from "@/lib/family-auth";
import { generateUniqueKidCode } from "@/lib/kids/kid-code";
import { verifyKidPin } from "@/lib/kids/kid-pin";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

/**
 * "New Kid Code": a fresh random code (name + 4 digits) for one child. The PIN stays the same
 * (it is hashed with the child id, not the code). The old code stops working at once, so the
 * child's tile on a device has to be added again with the new code.
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
    select: { id: true, displayName: true, kidCode: true, pinHash: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const kidCode = await generateUniqueKidCode(existing.displayName, async (code) => {
      if (code === existing.kidCode) return true;
      // The PIN may not equal the code's digits (checkPinForChild); skip such a code.
      const digits = code.slice(-4);
      if (existing.pinHash && (await verifyKidPin(existing.id, digits, existing.pinHash))) return true;
      return Boolean(await prisma.subProfile.findUnique({ where: { kidCode: code }, select: { id: true } }));
    });
    try {
      const sub = await prisma.subProfile.update({
        where: { id },
        data: { kidCode },
        select: { id: true, displayName: true, kidCode: true },
      });
      return NextResponse.json({ sub, kidCode: sub.kidCode });
    } catch (e) {
      // Unique-constraint race with another insert: try another code.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  return NextResponse.json({ error: "Could not make a new Kid Code. Please try again." }, { status: 500 });
}
