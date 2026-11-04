"use client";

import { BibleChapterDiscussion } from "@/components/bible/BibleChapterDiscussion";
import { BibleChapterPassage } from "@/components/bible/BibleChapterPassage";
import { BibleChapterReadingNotes } from "@/components/bible/BibleChapterReadingNotes";
import { MomsNotesPlaceholder } from "@/components/bible/MomsNotesPlaceholder";
import {
  catholicChapterHeading,
  getCatholicBookName,
} from "@/lib/bible/catholic-book-names";
import type { VerseLabel } from "@/lib/bible/chapter-pages";
import { readBibleUiLanguage, writeBibleUiLanguage } from "@/lib/bible/chapter-notes";
import {
  isPrayerLanguageCode,
  normalizePrayerLanguage,
  type PrayerLanguageCode,
} from "@/lib/prayers/prayer-languages";
import type { PassageMemoSetup } from "@/lib/bible-memos/passage-memos";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import "@/styles/bible-reader.css";

/** One Douay-Rheims chapter shown on the page (memos stay keyed by it). */
export type BibleReaderSegment = {
  douayChapter: number;
  citation: string;
  text: string;
  memoSetup: PassageMemoSetup | null;
  verseMarkers: readonly { verse: number; start: number }[];
  verseLabels: readonly VerseLabel[];
};

type Props = {
  bookSlug: string;
  apiBookName: string;
  /** URL chapter param (official NABRE numbering, lower case). */
  urlChapter: string;
  /** Official chapters on the page, e.g. "34" or "9–10". */
  chapterDisplay: string;
  douayDiffers: boolean;
  legacy: { douayChapter: number; href: string; label: string } | null;
  segments: readonly BibleReaderSegment[];
  discussionSignedIn: boolean;
  discussionReaderLabel: string;
};

function heading(bookSlug: string, display: string, locale: PrayerLanguageCode, apiBookName: string) {
  if (bookSlug === "psalms" && locale === "en") {
    return `${/[–,]/.test(display) ? "Psalms" : "Psalm"} ${display}`;
  }
  return catholicChapterHeading(bookSlug, display, locale, apiBookName);
}

export function BibleChapterReadClient({
  bookSlug,
  apiBookName,
  urlChapter,
  chapterDisplay,
  douayDiffers,
  legacy,
  segments,
  discussionSignedIn,
  discussionReaderLabel,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const langParam = searchParams.get("lang");
  const language = normalizePrayerLanguage(langParam);
  const [uiLanguage, setUiLanguage] = useState<PrayerLanguageCode>(language);
  const localizedBookName = getCatholicBookName(bookSlug, uiLanguage, apiBookName);
  const title = heading(bookSlug, chapterDisplay, uiLanguage, apiBookName);
  const douayList = segments.map((s) => s.douayChapter).join("–");
  const firstSegment = segments[0];

  useEffect(() => {
    setUiLanguage(language);
  }, [language]);

  useEffect(() => {
    if (langParam) return;
    try {
      const stored = readBibleUiLanguage();
      if (!isPrayerLanguageCode(stored)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", stored);
      router.replace(`/bible/read/${bookSlug}/${urlChapter}?${params.toString()}${window.location.hash}`, {
        scroll: false,
      });
    } catch {
      /* ignore */
    }
  }, [bookSlug, urlChapter, langParam, router, searchParams]);

  // #v-34-19 links: the passage pane scrolls on its own, so bring the verse into view.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "center" });
  }, []);

  const selectLanguage = useCallback(
    (code: PrayerLanguageCode) => {
      setUiLanguage(code);
      writeBibleUiLanguage(code);
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", code);
      router.replace(`/bible/read/${bookSlug}/${urlChapter}?${params.toString()}`, {
        scroll: false,
      });
    },
    [bookSlug, urlChapter, router, searchParams],
  );

  if (!firstSegment) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
          {title}
          {douayDiffers && (
            <span className="ml-2 align-middle text-sm font-medium text-[var(--color-muted)]">
              (Douay {douayList})
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {segments.map((s) => s.citation).join(" · ")}
        </p>
        {uiLanguage !== "en" && localizedBookName !== apiBookName && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">{apiBookName}</p>
        )}
        {legacy && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Chapter and verse numbers follow the official Catholic numbering. Looking for Douay-Rheims{" "}
            {bookSlug === "psalms" ? "Psalm" : localizedBookName} {legacy.douayChapter}? It is{" "}
            <Link href={legacy.href} className="font-semibold text-[var(--color-link)] hover:underline">
              {bookSlug === "psalms" ? "Psalm" : localizedBookName} {legacy.label}
            </Link>
            .
          </p>
        )}
      </div>

      <BibleChapterReadingNotes
        bookSlug={bookSlug}
        apiBookName={apiBookName}
        chapter={firstSegment.douayChapter}
        displayChapter={chapterDisplay}
        locale={uiLanguage}
        onLocaleChange={selectLanguage}
      />

      <div className="bible-reader gospel-typing gospel-typing--bible overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffaf5] shadow-sm">
        <div className="bible-reader__columns">
          <div className="bible-reader__passages">
            {segments.map((s) => (
              <BibleChapterPassage
                key={s.douayChapter}
                bookSlug={bookSlug}
                bookName={localizedBookName}
                segment={s}
                paneLabel={
                  segments.length > 1
                    ? `${title} · Douay-Rheims ${bookSlug === "psalms" ? "Psalm" : localizedBookName} ${s.douayChapter}`
                    : title
                }
              />
            ))}
          </div>
          <MomsNotesPlaceholder />
        </div>
      </div>

      <BibleChapterDiscussion
        bookSlug={bookSlug}
        chapter={firstSegment.douayChapter}
        initialSignedIn={discussionSignedIn}
        initialReaderLabel={discussionReaderLabel}
      />
    </div>
  );
}
