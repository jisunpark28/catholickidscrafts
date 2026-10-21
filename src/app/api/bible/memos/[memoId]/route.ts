import { memoAuthorInclude, resolveMemoViewer, toViewerMemoDto } from "@/lib/bible-memos/memo-access";
import { ownerWhere, parseMemoPatch } from "@/lib/bible-memos/passage-memos";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ memoId: string }> };

const signInError = () => NextResponse.json({ error: "Sign in to use memos" }, { status: 401 });

/**
 * Edit memo text, color, or sharing. Author only (ownerWhere scopes to the signed-in
 * reader, so parents cannot edit children's memos and vice versa). Needs Plus.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) return signInError();
  if (!(await hasPaidFeatures(key))) {
    return NextResponse.json(
      { error: "Editing memos is part of the family subscription", code: "subscription_required" },
      { status: 403 },
    );
  }
  const viewer = await resolveMemoViewer(key);
  if (!viewer) return signInError();
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const patch = parseMemoPatch(raw);
  if (typeof patch === "string") return NextResponse.json({ error: patch }, { status: 400 });
  const { memoId } = await params;
  const where = { id: memoId, ...ownerWhere(key) };
  const result = await prisma.biblePassageMemo.updateMany({ where, data: patch });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const row = await prisma.biblePassageMemo.findFirst({ where, include: memoAuthorInclude });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ memo: toViewerMemoDto(row, viewer) });
}

/** Delete: author only (no Plus needed). */
export async function DELETE(_request: Request, { params }: Ctx) {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) return signInError();
  const { memoId } = await params;
  const result = await prisma.biblePassageMemo.deleteMany({
    where: { id: memoId, ...ownerWhere(key) },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
