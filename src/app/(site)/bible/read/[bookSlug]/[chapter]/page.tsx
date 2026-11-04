import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  BibleChapterReadClient,
  type BibleReaderSegment,
} from "@/components/bible/BibleChapterReadClient";
import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { HubTypingWidth } from "@/components/HubTypingWidth";
import { getCatholicBookName } from "@/lib/bible/catholic-book-names";
import { resolveReadRoute, verseLabelsForDouayChapter } from "@/lib/bible/chapter-pages";
import { fetchBibleBooks, fetchBibleChapter } from "@/lib/bible/latinprayer";
import { modernizeVerse } from "@/lib/bible/modernize-for-reading";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { buildVerseOffsetTable, chapterTextVersion } from "@/lib/bible-memos/verse-offsets";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import { normalizePassageText } from "@/lib/typing-accuracy";
import { getHeaderSession } from "@/lib/get-header-session";
import { isHeaderSignedIn } from "@/lib/header-session";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

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

type SearchParams = Record<string, string | string[] | undefined>;
type Props = {
  params: Promise<{ bookSlug: string; chapter: string }>;
  searchParams: Promise<SearchParams>;
};

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

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
    description: `Read ${ref} from the Catholic Bible. Highlight verses and save memos with your family.`,
    path: `/bible/read/${route.slug}/${route.label.toLowerCase()}`,
  });
}

export default async function BibleReadPage({ params, searchParams }: Props) {
  const [{ bookSlug, chapter: chapterStr }, sp] = await Promise.all([params, searchParams]);
  const douayVerse = Number(first(sp.v));
  const route = resolveReadRoute(bookSlug, chapterStr, {
    douay: first(sp.douay) === "1",
    douayVerse: Number.isInteger(douayVerse) && douayVerse > 0 ? douayVerse : undefined,
  });
  if (route.type === "notFound") notFound();
  if (route.type === "redirect") {
    const lang = first(sp.lang);
    const [path, hash] = route.to.split("#");
    const to = `${path}${lang ? `?lang=${encodeURIComponent(lang)}` : ""}${hash ? `#${hash}` : ""}`;
    if (route.permanent) permanentRedirect(to);
    redirect(to);
  }

  let chapters;
  try {
    chapters = await Promise.all(route.douayChapters.map((d) => fetchBibleChapter(route.slug, d)));
  } catch {
    notFound();
  }
  // latinprayer.org answers some out-of-range chapters with a different chapter.
  if (chapters.some((c, i) => c.meta.chapter !== route.douayChapters[i])) notFound();

  const readerKey = await getReaderKey();
  const signedIn = isSignedInReaderKey(readerKey);
  const paid = await hasPaidFeatures(readerKey);

  const segments: BibleReaderSegment[] = chapters.map((data) => {
    // Same per-verse text and join as chapterPlainTextForReading, kept per verse for memo anchoring.
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
      memoSetup: verseTable
        ? {
            verseTable,
            textVersion: chapterTextVersion(normalizePassageText(text)),
            signedIn,
            paid,
          }
        : null,
      verseMarkers: verseTable?.verses ?? [],
      verseLabels: verseLabelsForDouayChapter(route.slug, data.meta.chapter, route.label),
    };
  });

  const headerSession = await getHeaderSession();
  const discussionSignedIn = isHeaderSignedIn(headerSession);
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
            bookSlug={route.slug}
            apiBookName={chapters[0]!.meta.book.name}
            urlChapter={route.label.toLowerCase()}
            chapterDisplay={route.chapterDisplay}
            segments={segments}
            discussionSignedIn={discussionSignedIn}
            discussionReaderLabel={readerLabel}
          />
        </Suspense>
      </HubTypingWidth>
    </TestamentPageShell>
  );
}
