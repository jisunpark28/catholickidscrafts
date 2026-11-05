import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const resource = await prisma.resource.findFirst({
    where: { slug, published: true },
    select: { id: true },
  });
  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.resource.update({
    where: { id: resource.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
