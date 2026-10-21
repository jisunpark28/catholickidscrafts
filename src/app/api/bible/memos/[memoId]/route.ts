import { ownerWhere, parseMemoBody, toMemoDto } from "@/lib/bible-memos/passage-memos";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ memoId: string }> };

/** Edit memo text. Owner only; needs Plus (after Plus ends memos are view/delete only). */
export async function PATCH(request: Request, { params }: Ctx) {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) {
    return NextResponse.json({ error: "Sign in to use memos" }, { status: 401 });
  }
  if (!(await hasPaidFeatures(key))) {
    return NextResponse.json(
      { error: "Editing memos is part of the family subscription", code: "subscription_required" },
      { status: 403 },
    );
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const input = parseMemoBody(raw);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const { memoId } = await params;
  const where = { id: memoId, ...ownerWhere(key) };
  const result = await prisma.biblePassageMemo.updateMany({ where, data: { body: input.body } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const row = await prisma.biblePassageMemo.findFirst({ where });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ memo: toMemoDto(row) });
}

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
