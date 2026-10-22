import { clearFamilyCookies, parentApiGuard } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * "Sign out of all devices": bump FamilyAccount.sessionVersion so every
 * parent and child (Access ID) session for this family stops working.
 */
export async function POST() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;
  await prisma.familyAccount.update({
    where: { id: session.familyAccountId },
    data: { sessionVersion: { increment: 1 } },
  });
  const res = NextResponse.json({ ok: true });
  clearFamilyCookies(res);
  return res;
}
