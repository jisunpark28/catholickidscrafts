"use client";

import { usePassageMemos } from "@/components/bible/usePassageMemos";
import type { BibleReaderSegment } from "@/components/bible/BibleChapterReadClient";
import type { VerseLabel } from "@/lib/bible/chapter-pages";
import { normalizePassageText } from "@/lib/typing-accuracy";
import { Fragment, useMemo, type ReactNode } from "react";

type Props = {
  bookSlug: string;
  bookName: string;
  segment: BibleReaderSegment;
  paneLabel: string;
};

/** The memo hook's passage props (empty object when memos are off). */
type PassageProps = {
  passageCharClassName?: (index: number) => string | undefined;
  renderAfterPassageChar?: (index: number) => ReactNode;
  passageAddon?: ReactNode;
  onPassageElement?: (el: HTMLParagraphElement | null) => void;
};

function VerseNumber({ label }: { label: VerseLabel }) {
  if (label.continued) return null;
  return (
    <span
      id={label.id}
      data-verse={label.verse}
      className={`bible-reader-verse${label.douay ? " bible-reader-verse--douay" : ""}`}
      title={label.douay ? `Douay-Rheims verse ${label.verse} (official numbering divides this text differently)` : undefined}
    >
      <span aria-hidden>
        {label.text}
        {label.douay ? "*" : ""}
      </span>
      <span className="sr-only">
        {label.douay ? `Douay-Rheims verse ${label.verse}. ` : `Verse ${label.text}. `}
      </span>
    </span>
  );
}

/**
 * Read-only chapter text (no typing). Characters keep the data-ci spans the memo hook anchors
 * to, and memo verse numbers stay Douay-Rheims; only the visible numbers are official ones.
 */
export function BibleChapterPassage({ bookSlug, bookName, segment, paneLabel }: Props) {
  const refLabels = useMemo(() => {
    const out: Record<number, string> = {};
    for (const l of segment.verseLabels) out[l.verse] = l.ref;
    return out;
  }, [segment.verseLabels]);
  const memos = usePassageMemos({
    bookSlug,
    bookName,
    chapter: segment.douayChapter,
    text: segment.text,
    setup: segment.memoSetup,
    refLabels,
  });
  const tp: PassageProps = memos.typingProps;
  const target = useMemo(() => normalizePassageText(segment.text), [segment.text]);
  const labelAt = useMemo(() => {
    const byVerse = new Map(segment.verseLabels.map((l) => [l.verse, l]));
    const map = new Map<number, VerseLabel>();
    for (const m of segment.verseMarkers) {
      map.set(m.start, byVerse.get(m.verse) ?? { verse: m.verse, text: String(m.verse), ref: String(m.verse), douay: true });
    }
    return map;
  }, [segment.verseLabels, segment.verseMarkers]);
  const hasDouayNumbers = segment.verseLabels.some((l) => l.douay);

  if (!target) {
    return <p className="text-sm text-[var(--color-muted)]">No text available for this chapter.</p>;
  }

  return (
    <section className="bible-reader__segment">
      <p className="gospel-typing__pane-label">{paneLabel}</p>
      <div className="relative">
        <p
          ref={(el) => tp.onPassageElement?.(el)}
          className="gospel-typing-passage gospel-typing__pane-content bible-reader__passage mb-0 rounded-xl border border-[#e8e0d6] bg-[#fdf8f3] text-[var(--color-ink)]"
        >
          {target.split("").map((char, i) => {
            const label = labelAt.get(i);
            return (
              <Fragment key={i}>
                {label ? <VerseNumber label={label} /> : null}
                <span data-ci={i} className={tp.passageCharClassName?.(i)}>
                  {char}
                </span>
                {tp.renderAfterPassageChar?.(i)}
              </Fragment>
            );
          })}
        </p>
        {tp.passageAddon}
      </div>
      {hasDouayNumbers && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          * Verse numbers with an asterisk are Douay-Rheims numbers: the official Catholic numbering
          divides this text differently.
        </p>
      )}
      {memos.panel}
    </section>
  );
}
