import { clearFamilyCookies, requireFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * "Sign out of all devices": bump FamilyAccount.sessionVersion so every
 * parent and child (Access ID) session for this family stops working.
 */
export async function POST() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  await prisma.familyAccount.update({
    where: { id: session.familyAccountId },
    data: { sessionVersion: { increment: 1 } },
  });
  const res = NextResponse.json({ ok: true });
  clearFamilyCookies(res);
  return res;
}
