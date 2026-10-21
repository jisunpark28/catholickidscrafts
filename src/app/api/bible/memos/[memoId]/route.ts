import { ownerWhere } from "@/lib/bible-memos/passage-memos";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ memoId: string }> };

export async function DELETE(_request: Request, { params }: Ctx) {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) {
    return NextResponse.json({ error: "Sign in to use memos" }, { status: 401 });
  }
  const { memoId } = await params;
  const result = await prisma.biblePassageMemo.deleteMany({
    where: { id: memoId, ...ownerWhere(key) },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
