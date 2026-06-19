import { requireFamilySession } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  let body: { displayName?: string; active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await prisma.subProfile.findFirst({
    where: { id, familyAccountId: session.familyAccountId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const displayName = body.displayName?.trim();
  const data: { displayName?: string; active?: boolean } = {};
  if (displayName) data.displayName = displayName;
  if (typeof body.active === "boolean") data.active = body.active;

  const sub = await prisma.subProfile.update({
    where: { id },
    data,
    select: {
      id: true,
      displayName: true,
      accessCodeLast4: true,
      active: true,
    },
  });

  return NextResponse.json({ sub });
}

export async function DELETE(_request: Request, { params }: Params) {
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

  await prisma.subProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
