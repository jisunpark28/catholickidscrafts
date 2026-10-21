import { loadVisibleMemos, memoAuthorInclude, resolveMemoViewer, toViewerMemoDto } from "@/lib/bible-memos/memo-access";
import { ownerWhere, parseMemoInput } from "@/lib/bible-memos/passage-memos";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { freeJournalSlotLeft } from "@/lib/daily-mass/faith-journal";
import { isJournalMemo } from "@/lib/daily-mass/faith-journal-shared";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const signInError = () => NextResponse.json({ error: "Sign in to use memos" }, { status: 401 });

export async function GET(request: Request) {
  // Viewing memos only needs sign-in (read-only after Plus ends).
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) return signInError();
  const viewer = await resolveMemoViewer(key);
  if (!viewer) return signInError();
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("bookSlug")?.trim();
  const chapter = Number(searchParams.get("chapter"));
  if (!bookSlug || !Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json({ error: "bookSlug and chapter are required" }, { status: 400 });
  }
  const memos = (await loadVisibleMemos(viewer, { bookSlug, chapter }, 500)).sort(
    (a, b) => a.startVerse - b.startVerse || a.createdAt.localeCompare(b.createdAt),
  );
  const total = await prisma.biblePassageMemo.count({
    where: { ...ownerWhere(key), visibility: { in: ["PRIVATE", "FAMILY"] } },
  });
  return NextResponse.json({ memos, total });
}

export async function POST(request: Request) {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) return signInError();
  const paid = await hasPaidFeatures(key);
  const viewer = await resolveMemoViewer(key);
  if (!viewer) return signInError();
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const input = parseMemoInput(raw);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  // Memos are Plus-only, except a family's first FREE_JOURNAL_LIMIT Faith Journal entries (Daily Mass banner).
  if (!paid) {
    const journal = isJournalMemo(input);
    if (!journal || !(await freeJournalSlotLeft(key))) {
      return NextResponse.json(
        journal
          ? { error: "You've used your free Faith Journal entries", code: "journal_limit" }
          : { error: "Memos are part of the family subscription", code: "subscription_required" },
        { status: 403 },
      );
    }
  }
  try {
    const row = await prisma.biblePassageMemo.create({
      data: { ...input, ...ownerWhere(key) },
      include: memoAuthorInclude,
    });
    return NextResponse.json({ memo: toViewerMemoDto(row, viewer) }, { status: 201 });
  } catch (e) {
    console.error("bible memo save", e);
    return NextResponse.json({ error: "Could not save memo" }, { status: 500 });
  }
}
