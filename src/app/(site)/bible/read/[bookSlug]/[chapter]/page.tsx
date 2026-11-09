import { BibleExploreLinks } from "@/components/bible/BibleExploreLinks";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import {
  BibleChapterReadClient,
  type BibleReaderSegment,
} from "@/components/bible/BibleChapterReadClient";
import { ReadingSizeBootstrap } from "@/components/bible/ReadingSizeBootstrap";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { getCatholicBookName } from "@/lib/bible/catholic-book-names";
import { resolveReadRoute, verseLabelsForDouayChapter } from "@/lib/bible/chapter-pages";
import { fetchBibleBooks, fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { buildVerseOffsetTable } from "@/lib/bible-memos/verse-offsets";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

/**
 * Static chapter page (ISR): the same public scripture HTML for everyone, built on the first
 * visit and refreshed daily. No cookies or query strings are read here. Mom's Bible, the
 * toolbar, banners and the reader's name load in the browser from authenticated APIs
 * (BibleChapterReadClient). Old storage-numbered links (?douay=1) are redirected before
 * this page by a rewrite in next.config.ts.
 */
export const revalidate = 86400;
export const dynamicParams = true;

/** Nothing at build time (no burst of requests to latinprayer.org); each chapter is cached on first visit. */
export function generateStaticParams(): { bookSlug: string; chapter: string }[] {
  return [];
}

const TITLE_SUFFIX = " | Catholic Kids Crafts";

/** Keep the full title at 60 characters or less (see titles proposal). */
function chapterTitle(ref: string): { title: string; absoluteTitle?: boolean } {
  for (const title of [`${ref} – Read the Catholic Bible`, `${ref} – Catholic Bible`]) {
    if (title.length + TITLE_SUFFIX.length <= 60) return { title };
  }
  return { title: `${ref} – Catholic Bible for Kids`, absoluteTitle: true };
}

/** "Psalm 34", "Psalms 9–10", "Genesis 1" (official numbering). */
function displayRef(slug: string, bookName: string, chapterDisplay: string): string {
  if (slug === "psalms") return `${/[–,]/.test(chapterDisplay) ? "Psalms" : "Psalm"} ${chapterDisplay}`;
  return `${bookName} ${chapterDisplay}`;
}

type Props = {
  params: Promise<{ bookSlug: string; chapter: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug, chapter } = await params;
  const route = resolveReadRoute(bookSlug, chapter);
  if (route.type !== "page") return { title: "Bible chapter" };
  const books = await fetchBibleBooks().catch(() => []);
  const bookName =
    books.find((b) => b.slug === route.slug)?.name ?? getCatholicBookName(route.slug, "en", route.slug);
  const ref = displayRef(route.slug, bookName, route.chapterDisplay);
  return pageMetadata({
    ...chapterTitle(ref),
    description: `Read ${ref} from the Catholic Bible. Highlight verses and leave notes for your child.`,
    path: `/bible/read/${route.slug}/${route.label.toLowerCase()}`,
  });
}

export default async function BibleReadPage({ params }: Props) {
  const { bookSlug, chapter: chapterStr } = await params;
  const route = resolveReadRoute(bookSlug, chapterStr);
  if (route.type === "notFound") notFound();
  if (route.type === "redirect") {
    if (route.permanent) permanentRedirect(route.to);
    redirect(route.to);
  }

  // A failed fetch throws (error page, not cached) instead of caching a 404 for a day.
  const chapters = await Promise.all(route.douayChapters.map((d) => fetchBibleChapter(route.slug, d)));
  // latinprayer.org answers some out-of-range chapters with a different chapter.
  if (chapters.some((c, i) => c.meta.chapter !== route.douayChapters[i])) notFound();

  const segments: BibleReaderSegment[] = chapters.map((data) => {
    // Same per-verse text and join as chapterPlainTextForReading, kept per verse for verse blocks.
    const verseTexts = data.verses.map((v) => ({
      verse: v.verse,
      text: modernizeVerse(data.meta.book.slug, data.meta.chapter, v.verse, v.text),
    }));
    const text = verseTexts.map((v) => v.text).join(" ");
    const verseTable = buildVerseOffsetTable(verseTexts);
    return {
      douayChapter: data.meta.chapter,
      citation: data.citation,
      text,
      verseMarkers: verseTable?.verses ?? [],
      verseLabels: verseLabelsForDouayChapter(route.slug, data.meta.chapter, route.label),
    };
  });

  return (
    <TestamentPageShell>
      <HubTypingWidth wide className="space-y-4">
        <BibleExploreLinks />
        <ReadingSizeBootstrap />
        <BibleChapterReadClient
          bookSlug={route.slug}
          apiBookName={chapters[0]!.meta.book.name}
          urlChapter={route.label.toLowerCase()}
          chapterDisplay={route.chapterDisplay}
          segments={segments}
        />
      </HubTypingWidth>
    </TestamentPageShell>
  );
}
