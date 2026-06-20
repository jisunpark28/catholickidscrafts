import { getFamilySession } from "@/lib/family-auth";
import { getReaderKey } from "@/lib/bible/reader";
import type { HeaderSessionResponse } from "@/lib/header-session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [familySession, readerKey] = await Promise.all([
    getFamilySession(),
    getReaderKey(),
  ]);

  let family: HeaderSessionResponse["family"] = null;
  if (familySession) {
    const account = await prisma.familyAccount.findUnique({
      where: { id: familySession.familyAccountId },
      select: { email: true, displayName: true },
    });
    if (account) {
      family = {
        email: account.email,
        displayName: account.displayName,
      };
    }
  }

  let reader: HeaderSessionResponse["reader"] = null;
  if (readerKey && readerKey.type !== "guest") {
    if (readerKey.type === "owner") {
      const account = await prisma.familyAccount.findUnique({
        where: { id: readerKey.familyAccountId },
        select: { displayName: true, email: true },
      });
      reader = {
        type: "owner",
        displayName: account?.displayName ?? account?.email ?? "Parent",
      };
    } else {
      const sub = await prisma.subProfile.findUnique({
        where: { id: readerKey.subProfileId },
        select: { displayName: true, active: true },
      });
      if (sub?.active) {
        reader = { type: "sub", displayName: sub.displayName };
      }
    }
  }

  return NextResponse.json({ family, reader } satisfies HeaderSessionResponse);
}
