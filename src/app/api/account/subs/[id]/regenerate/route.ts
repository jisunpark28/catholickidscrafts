import {
  accessCodeLast4,
  accessCodeLookupKey,
  generateAccessCode,
  hashAccessCode,
  isValidAccessCodeFormat,
  normalizeAccessCode,
} from "@/lib/access-code";
import { requireFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

async function uniqueAccessCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateAccessCode();
    const normalized = normalizeAccessCode(code);
    const lookup = accessCodeLookupKey(normalized);
    const existing = await prisma.subProfile.findUnique({
      where: { accessCodeLookup: lookup },
      select: { id: true },
    });
    if (!existing && isValidAccessCodeFormat(normalized)) return normalized;
  }
  throw new Error("Could not generate unique Access ID");
}

export async function POST(_request: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.subProfile.findFirst({
    where: { id, familyAccountId: session.familyAccountId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const normalized = await uniqueAccessCode();
  const accessCodeHash = await hashAccessCode(normalized);

  const sub = await prisma.subProfile.update({
    where: { id },
    data: {
      accessCodeHash,
      accessCodeLookup: accessCodeLookupKey(normalized),
      accessCodeLast4: accessCodeLast4(normalized),
    },
    select: { id: true, displayName: true, accessCodeLast4: true },
  });

  return NextResponse.json({
    sub,
    accessId: normalized,
  });
}
