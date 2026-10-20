import { ownerWhere, parseMemoInput, toMemoDto } from "@/lib/bible-memos/passage-memos";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function requirePaidReader() {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) {
    return { key: null, error: NextResponse.json({ error: "Sign in to use memos" }, { status: 401 }) };
  }
  if (!(await hasPaidFeatures(key))) {
    return {
      key: null,
      error: NextResponse.json(
        { error: "Memos are part of the family subscription", code: "subscription_required" },
        { status: 403 },
      ),
    };
  }
  return { key, error: null };
}

export async function GET(request: Request) {
  const { key, error } = await requirePaidReader();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("bookSlug")?.trim();
  const chapter = Number(searchParams.get("chapter"));
  if (!bookSlug || !Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
  }
  const rows = await prisma.biblePassageMemo.findMany({
    where: { ...ownerWhere(key), bookSlug, chapter },
    orderBy: [{ startVerse: "asc" }, { createdAt: "asc" }],
    take: 500,
  });
  return NextResponse.json({ memos: rows.map(toMemoDto) });
}

export async function POST(request: Request) {
  const { key, error } = await requirePaidReader();
  if (error) return error;
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const input = parseMemoInput(raw);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  try {
    const row = await prisma.biblePassageMemo.create({
      data: { ...input, ...ownerWhere(key), visibility: "PRIVATE" },
    });
    return NextResponse.json({ memo: toMemoDto(row) }, { status: 201 });
  } catch (e) {
    console.error("bible memo save", e);
    return NextResponse.json({ error: "Could not save memo" }, { status: 500 });
  }
}
