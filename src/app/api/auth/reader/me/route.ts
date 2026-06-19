import { getReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const key = await getReaderKey();
  if (!key || key.type === "guest") {
    return NextResponse.json({ reader: null });
  }

  if (key.type === "owner") {
    const account = await prisma.familyAccount.findUnique({
      where: { id: key.familyAccountId },
      select: { displayName: true, email: true },
    });
    return NextResponse.json({
      reader: {
        type: "owner",
        displayName: account?.displayName ?? account?.email ?? "Parent",
        email: account?.email,
      },
    });
  }

  const sub = await prisma.subProfile.findUnique({
    where: { id: key.subProfileId },
    select: { displayName: true, active: true },
  });
  if (!sub?.active) {
    return NextResponse.json({ reader: null });
  }

  return NextResponse.json({
    reader: { type: "sub", displayName: sub.displayName },
  });
}
