import { parentApiGuard } from "@/lib/family-auth";
import { hashKidPin, kidPinStatus } from "@/lib/kids/kid-pin";
import { checkPinForChild } from "@/lib/kids/pin-policy";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Set or reset a child's 4-digit PIN. Parent session only (not child mode), same-origin,
 * and the parent must own the child or be linked to it. Clears the lockout.
 */
export async function PUT(request: Request, { params }: Params) {
  const originError = crossOriginError(request);
  if (originError) return originError;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;

  const { id } = await params;
  let body: { pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  const sub = await prisma.subProfile.findFirst({
    where: {
      id,
      OR: [
        { familyAccountId: session.familyAccountId },
        { parentLinks: { some: { parentAccountId: session.familyAccountId } } },
      ],
    },
    select: { id: true, kidCode: true },
  });
  if (!sub) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const policy = checkPinForChild(pin, sub.kidCode);
  if (!policy.ok) {
    return NextResponse.json({ error: policy.message, reason: policy.reason }, { status: 400 });
  }

  const pinHash = await hashKidPin(sub.id, pin);
  const updated = await prisma.subProfile.update({
    where: { id: sub.id },
    data: {
      pinHash,
      pinSetAt: new Date(),
      pinFailCount: 0,
      pinLockedUntil: null,
      pinDisabledAt: null,
    },
    select: { id: true, kidCode: true, pinHash: true, pinLockedUntil: true, pinDisabledAt: true },
  });

  return NextResponse.json({
    ok: true,
    sub: { id: updated.id, kidCode: updated.kidCode, pinStatus: kidPinStatus(updated, new Date()) },
  });
}
