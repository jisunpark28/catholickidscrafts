import { parentApiGuard } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { resetSessionOnResponse } from "@/lib/session-reset";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * "Sign out of all devices": bump FamilyAccount.sessionVersion so every
 * parent and child (Access ID) session for this family stops working.
 * This device is fully reset either way, even when the request is not from an active parent.
 */
export async function POST() {
  const jar = await cookies();
  const present = jar.getAll().map((c) => c.name);
  const guard = await parentApiGuard();
  if (guard.error) {
    resetSessionOnResponse(guard.error, present);
    return guard.error;
  }
  const { session } = guard;
  await prisma.familyAccount.update({
    where: { id: session.familyAccountId },
    data: { sessionVersion: { increment: 1 } },
  });
  const res = NextResponse.json({ ok: true });
  resetSessionOnResponse(res, present);
  return res;
}
