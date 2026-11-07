"use client";

import { ReadingSizeControls, useReadingSize } from "@/components/bible/ReadingSizeControls";
import { BibleChapterDiscussion } from "@/components/bible/BibleChapterDiscussion";
import { BibleChapterPassage, type PassageMomsBible } from "@/components/bible/BibleChapterPassage";
import { BibleChapterReadingNotes } from "@/components/bible/BibleChapterReadingNotes";
import { MbPalette, MomsBiblePanel } from "@/components/moms-bible/MomsBiblePanel";
import { MomsBibleSignInCard } from "@/components/moms-bible/MomsBibleSignInCard";
import { PlusModal } from "@/components/moms-bible/PlusModal";
import { useMomsBible } from "@/components/moms-bible/useMomsBible";
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
import type { MbChapterView } from "@/lib/moms-bible/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import "@/styles/bible-reader.css";

/** One storage chapter shown on the page (Mom's Bible marks stay keyed by it). */
export type BibleReaderSegment = {
  douayChapter: number;
  citation: string;
  text: string;
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
  segments: readonly BibleReaderSegment[];
  discussionSignedIn: boolean;
  discussionReaderLabel: string;
  /** Mom's Bible data for a parent (selected child) or a signed-in child; null otherwise. */
  momsBible?: MbChapterView | null;
  /** Who sees the "how Mom's Bible works" card instead: guests, or a parent with no child yet. */
  momsBibleIntro?: "guest" | "no-child" | null;
  /** Toolbar and banners shown above the title, inside the reader panel. */
  header?: ReactNode;
};

function heading(bookSlug: string, display: string, locale: PrayerLanguageCode, apiBookName: string) {
  if (bookSlug === "psalms" && locale === "en") {
    return `${/[–,]/.test(display) ? "Psalms" : "Psalm"} ${display}`;
  }
  return catholicChapterHeading(bookSlug, display, locale, apiBookName);
}

/** "Psalm 116:1–9" for one part of a page made of several text sections (official numbers). */
function segmentLabel(bookName: string, labels: readonly VerseLabel[], fallback: string): string {
  const refs = labels.filter((l) => !l.douay && !l.continued).map((l) => l.ref);
  const first = refs[0];
  const last = refs[refs.length - 1];
  if (!first || !last) return fallback;
  const [c1] = first.split(":");
  const [c2, v2] = last.split(":");
  const end = (v2 ?? "").split("\u2013").pop();
  if (first === last) return `${bookName} ${first}`;
  return c1 === c2 && end ? `${bookName} ${first}\u2013${end}` : `${bookName} ${first}\u2013${last}`;
}

export function BibleChapterReadClient({
  bookSlug,
  apiBookName,
  urlChapter,
  chapterDisplay,
  segments,
  discussionSignedIn,
  discussionReaderLabel,
  momsBible,
  momsBibleIntro,
  header,
}: Props) {
  const { size, change, ready } = useReadingSize();
  const searchParams = useSearchParams();
  const router = useRouter();
  const langParam = searchParams.get("lang");
  const language = normalizePrayerLanguage(langParam);
  const [uiLanguage, setUiLanguage] = useState<PrayerLanguageCode>(language);
  const localizedBookName = getCatholicBookName(bookSlug, uiLanguage, apiBookName);
  const title = heading(bookSlug, chapterDisplay, uiLanguage, apiBookName);
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

  // #v-34-19 links: bring the verse into view.
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

  const paneLabel = (s: BibleReaderSegment) =>
    segments.length > 1 ? segmentLabel(bookSlug === "psalms" ? "Psalm" : localizedBookName, s.verseLabels, title) : null;
  const refBookName = bookSlug === "psalms" ? "Psalm" : getCatholicBookName(bookSlug, "en", apiBookName);

  return (
    <div className="space-y-4">
      <div
        className="bible-reader space-y-4 rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8"
        style={ready ? ({ "--bible-reading-size": `${size}px` } as CSSProperties) : undefined}
      >
        {header}
        <div>
          <h1 className="bible-reader__title">{title}</h1>
          {uiLanguage !== "en" && localizedBookName !== apiBookName && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">{apiBookName}</p>
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

        <ReadingSizeControls size={size} change={change} />

        {momsBible ? (
          <ColumnsWithMomsBible
            key={`${momsBible.childId}:${momsBible.preview ? "sample" : "live"}`}
            view={momsBible}
            bookSlug={bookSlug}
            refBookName={refBookName}
            segments={segments}
            initialSituation={searchParams.get("situation")}
            renderPassage={(s, mbProps) => (
              <BibleChapterPassage key={s.douayChapter} segment={s} paneLabel={paneLabel(s)} momsBible={mbProps} />
            )}
          />
        ) : (
          <div className="bible-reader__columns">
            <div className="bible-reader__passages">
              {segments.map((s) => (
                <BibleChapterPassage key={s.douayChapter} segment={s} paneLabel={paneLabel(s)} />
              ))}
            </div>
            <MomsBibleSignInCard variant={momsBibleIntro ?? "guest"} />
          </div>
        )}
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

/** Passage + Mom's Bible column sharing one state (marks on the text, notes on the right). */
function ColumnsWithMomsBible({
  view,
  bookSlug,
  refBookName,
  segments,
  initialSituation,
  renderPassage,
}: {
  view: MbChapterView;
  bookSlug: string;
  refBookName: string;
  segments: readonly BibleReaderSegment[];
  initialSituation: string | null;
  renderPassage: (s: BibleReaderSegment, mb: PassageMomsBible) => ReactNode;
}) {
  const chapters = segments.map((s) => s.douayChapter);
  const mb = useMomsBible(view, bookSlug, chapters);
  const { setSelected, canSelectVerses } = mb;

  // "Open & leave a note" from the situations page: pre-select the linked verse for the parent.
  useEffect(() => {
    if (!canSelectVerses || !initialSituation) return;
    const id = window.location.hash.slice(1);
    for (const s of segments) {
      const l = s.verseLabels.find((x) => x.id === id && !x.continued && !x.douay);
      if (l) {
        setSelected({ chapter: s.douayChapter, verse: l.verse });
        return;
      }
    }
  }, [canSelectVerses, initialSituation, segments, setSelected]);

  const passageMb: PassageMomsBible = {
    verseClass: mb.verseClass,
    onVerseClick: canSelectVerses
      ? (chapter, verse) =>
          setSelected((cur) => (cur && cur.chapter === chapter && cur.verse === verse ? null : { chapter, verse }))
      : undefined,
    renderAfterVerse: (chapter, verse) =>
      mb.selected && mb.selected.chapter === chapter && mb.selected.verse === verse ? (
        <MbPalette mb={mb} situationKey={initialSituation} />
      ) : null,
  };

  return (
    <div className="bible-reader__columns">
      <div className="bible-reader__passages">{segments.map((s) => renderPassage(s, passageMb))}</div>
      <MomsBiblePanel
        mb={mb}
        bookSlug={bookSlug}
        refBookName={refBookName}
        segments={segments}
        initialSituation={initialSituation}
      />
      <PlusModal open={mb.plusOpen} onClose={() => mb.setPlusOpen(false)} />
    </div>
  );
}
