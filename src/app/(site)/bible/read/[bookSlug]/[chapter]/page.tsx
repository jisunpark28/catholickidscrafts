import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BibleChapterReadClient } from "@/components/bible/BibleChapterReadClient";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import type { PassageMemoSetup } from "@/lib/bible-memos/passage-memos";
import { buildVerseOffsetTable, chapterTextVersion } from "@/lib/bible-memos/verse-offsets";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import { normalizePassageText } from "@/lib/typing-accuracy";
import { getHeaderSession } from "@/lib/get-header-session";
import { isHeaderSignedIn } from "@/lib/header-session";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ bookSlug: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug, chapter } = await params;
  return {
    title: `Type ${bookSlug} ${chapter}`,
    ...canonicalForPath(`/bible/read/${bookSlug}/${chapter}`),
  };
}

export default async function BibleReadPage({ params }: Props) {
  const { bookSlug, chapter: chapterStr } = await params;
  const chapterNum = Number(chapterStr);
  if (!Number.isFinite(chapterNum) || chapterNum < 1) notFound();

  let data;
  try {
    data = await fetchBibleChapter(bookSlug, chapterNum);
  } catch {
    notFound();
  }

  // Same per-verse text and join as chapterPlainTextForReading, kept per verse for memo anchoring.
  const verseTexts = data.verses.map((v) => ({
    verse: v.verse,
    text: modernizeVerse(data.meta.book.slug, data.meta.chapter, v.verse, v.text),
  }));
  const text = verseTexts.map((v) => v.text).join(" ");
  const verseTable = buildVerseOffsetTable(verseTexts);
  const readerKey = await getReaderKey();
  const memoSetup: PassageMemoSetup | null = verseTable
    ? {
        verseTable,
        textVersion: chapterTextVersion(normalizePassageText(text)),
        signedIn: isSignedInReaderKey(readerKey),
        paid: await hasPaidFeatures(readerKey),
      }
    : null;
  const headerSession = await getHeaderSession();
  const signedIn = isHeaderSignedIn(headerSession);
  const readerLabel =
    headerSession.reader?.displayName ??
    headerSession.family?.displayName?.trim() ??
    headerSession.family?.email?.split("@")[0] ??
    "?";

  return (
    <TestamentPageShell>
      <HubTypingWidth wide className="space-y-4">
        <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Loading…</p>}>
          <BibleChapterReadClient
            bookSlug={bookSlug}
            apiBookName={data.meta.book.name}
            chapter={data.meta.chapter}
            citation={data.citation}
            text={text}
            discussionSignedIn={signedIn}
            discussionReaderLabel={readerLabel}
            memoSetup={memoSetup}
          />
        </Suspense>
      </HubTypingWidth>
    </TestamentPageShell>
  );
}
