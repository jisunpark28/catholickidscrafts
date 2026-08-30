import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BibleChapterReadClient } from "@/components/bible/BibleChapterReadClient";
import { BibleHubShell } from "@/components/bible/BibleHubShell";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { fetchBibleChapter } from "@/lib/bible/latinprayer";
import { chapterPlainTextForReading } from "@/lib/bible/reading-text";
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

  const text = chapterPlainTextForReading(data);
  const headerSession = await getHeaderSession();
  const signedIn = isHeaderSignedIn(headerSession);
  const readerLabel =
    headerSession.reader?.displayName ??
    headerSession.family?.displayName?.trim() ??
    headerSession.family?.email?.split("@")[0] ??
    "?";

  return (
    <BibleHubShell
      backHref={`/bible/${bookSlug}`}
      backLabel={`← ${data.meta.book.name}`}
      compact
      wide
    >
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
          />
        </Suspense>
      </HubTypingWidth>
    </BibleHubShell>
  );
}
