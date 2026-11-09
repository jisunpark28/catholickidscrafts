"use client";

import { ReadingSizeControls, useReadingSize } from "@/components/bible/ReadingSizeControls";
import { BibleChapterDiscussion } from "@/components/bible/BibleChapterDiscussion";
import { BibleChapterPassage, type PassageMomsBible } from "@/components/bible/BibleChapterPassage";
import { BibleChapterReadingNotes } from "@/components/bible/BibleChapterReadingNotes";
import { NewNoteBanner, ParentReplyBanner } from "@/components/moms-bible/MbBanners";
import { MbToolbar } from "@/components/moms-bible/MbToolbar";
import { mbFetch } from "@/components/moms-bible/mb-fetch";
import { MbPalette, MomsBiblePanel } from "@/components/moms-bible/MomsBiblePanel";
import { MomsBibleSignInCard } from "@/components/moms-bible/MomsBibleSignInCard";
import { PlusModal } from "@/components/moms-bible/PlusModal";
import { useMomsBible } from "@/components/moms-bible/useMomsBible";
import { useSiteSession } from "@/components/SiteSessionProvider";
import { SAMPLE_BOOK, SAMPLE_CHAPTER, sampleGenesisView } from "@/data/moms-bible/sample-genesis-1";
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
import { isHeaderSignedIn } from "@/lib/header-session";
import type { ReaderMomsBible } from "@/lib/moms-bible/page-data";
import type { MbChapterView } from "@/lib/moms-bible/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
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
};

/**
 * The page is static (same HTML for everyone), so the query string is read here in the browser.
 * Only this tiny component uses useSearchParams, inside its own Suspense, so the chapter text
 * is still in the server HTML.
 */
function QueryBridge({ onChange }: { onChange: (q: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange(new URLSearchParams(searchParams.toString()));
  }, [searchParams, onChange]);
  return null;
}

/** What a guest sees (same as the server's guest result): the Genesis 1 sample, intro card, "Get Plus". */
function guestMomsBible(bookSlug: string, chapters: readonly number[]): ReaderMomsBible {
  const sample = bookSlug === SAMPLE_BOOK && chapters.includes(SAMPLE_CHAPTER);
  return { view: sample ? sampleGenesisView() : null, intro: "guest", childBanner: null, parentBanner: null, toolbar: null };
}

type MbLoad = { status: "loading" } | { status: "ready"; data: ReaderMomsBible };

/**
 * Per-user Mom's Bible data for this chapter, loaded once the site session is known. Guests never
 * call the API. Signed-in readers get it from /api/moms-bible/reader, which runs the same
 * server checks the page used to (session identity, linked child only, Plus / Family Pass).
 */
function useReaderMomsBible(bookSlug: string, chaptersKey: string, childParam: string | null, queryReady: boolean) {
  const { ready, session } = useSiteSession();
  const signedIn = isHeaderSignedIn(session);
  const [state, setState] = useState<MbLoad>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!ready || !queryReady) return;
    const chapters = chaptersKey.split(",").map(Number);
    if (!signedIn) {
      setState({ status: "ready", data: guestMomsBible(bookSlug, chapters) });
      return;
    }
    let cancelled = false;
    const q = new URLSearchParams({ book: bookSlug, chapters: chaptersKey });
    if (childParam) q.set("child", childParam);
    void mbFetch<ReaderMomsBible>(`/api/moms-bible/reader?${q.toString()}`).then((res) => {
      if (cancelled) return;
      // Same as before when the server lookup failed: show the guest version.
      setState({ status: "ready", data: res.ok ? res.data : guestMomsBible(bookSlug, chapters) });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, queryReady, signedIn, bookSlug, chaptersKey, childParam, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { state, reload };
}

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
}: Props) {
  const { size, change, ready } = useReadingSize();
  const router = useRouter();
  /** Query string, known after hydration (null on the server and in the first render). */
  const [query, setQuery] = useState<URLSearchParams | null>(null);
  const langParam = query?.get("lang") ?? null;
  const language = normalizePrayerLanguage(langParam);
  const [uiLanguage, setUiLanguage] = useState<PrayerLanguageCode>(language);
  const localizedBookName = getCatholicBookName(bookSlug, uiLanguage, apiBookName);
  const title = heading(bookSlug, chapterDisplay, uiLanguage, apiBookName);
  const firstSegment = segments[0];
  const chaptersKey = segments.map((s) => s.douayChapter).join(",");
  const { state: mbState, reload: reloadMomsBible } = useReaderMomsBible(
    bookSlug,
    chaptersKey,
    query?.get("child") ?? null,
    query !== null,
  );
  const { session } = useSiteSession();
  const discussionSignedIn = isHeaderSignedIn(session);
  const discussionReaderLabel =
    session.reader?.displayName ??
    session.family?.displayName?.trim() ??
    session.family?.email?.split("@")[0] ??
    "?";

  useEffect(() => {
    setUiLanguage(language);
  }, [language]);

  useEffect(() => {
    if (!query || langParam) return;
    try {
      const stored = readBibleUiLanguage();
      if (!isPrayerLanguageCode(stored)) return;
      const params = new URLSearchParams(query.toString());
      params.set("lang", stored);
      router.replace(`/bible/read/${bookSlug}/${urlChapter}?${params.toString()}${window.location.hash}`, {
        scroll: false,
      });
    } catch {
      /* ignore */
    }
  }, [bookSlug, urlChapter, langParam, router, query]);

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
      const params = new URLSearchParams(query?.toString() ?? window.location.search);
      params.set("lang", code);
      router.replace(`/bible/read/${bookSlug}/${urlChapter}?${params.toString()}`, {
        scroll: false,
      });
    },
    [bookSlug, urlChapter, router, query],
  );

  if (!firstSegment) return null;

  const paneLabel = (s: BibleReaderSegment) =>
    segments.length > 1 ? segmentLabel(bookSlug === "psalms" ? "Psalm" : localizedBookName, s.verseLabels, title) : null;
  const refBookName = bookSlug === "psalms" ? "Psalm" : getCatholicBookName(bookSlug, "en", apiBookName);

  const mb = mbState.status === "ready" ? mbState.data : null;
  const momsBible = mb?.view ?? null;
  const header = !mb ? (
    // Same height as the toolbar row, so the title does not jump when it loads.
    <div className="mb-toolbar" aria-hidden="true">
      <span className="mb-pill invisible">
        <span>⭐</span> Get Plus
      </span>
    </div>
  ) : mb.toolbar || mb.intro === "guest" || mb.childBanner || mb.parentBanner ? (
    <>
      {(mb.toolbar || mb.intro === "guest") && (
        <MbToolbar
          data={mb.toolbar}
          // Dropping ?child= already reloads (the query changes); otherwise reload for the new cookie.
          onSwitch={() => {
            if (!query?.get("child")) reloadMomsBible();
          }}
        />
      )}
      {mb.childBanner && <NewNoteBanner note={mb.childBanner} />}
      {mb.parentBanner && <ParentReplyBanner data={mb.parentBanner} />}
    </>
  ) : null;

  return (
    <div className="space-y-4">
      <Suspense fallback={null}>
        <QueryBridge onChange={setQuery} />
      </Suspense>
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
            initialSituation={query?.get("situation") ?? null}
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
            {mb ? (
              <MomsBibleSignInCard variant={mb.intro ?? "guest"} />
            ) : (
              // Notes column while the reader's own data loads (text above stays put).
              <aside className="bible-reader__notes mb-panel" aria-busy="true" aria-label="Loading Mom's Bible" />
            )}
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
