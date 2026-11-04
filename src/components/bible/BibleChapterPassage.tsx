"use client";

import { usePassageMemos } from "@/components/bible/usePassageMemos";
import type { BibleReaderSegment } from "@/components/bible/BibleChapterReadClient";
import type { VerseLabel } from "@/lib/bible/chapter-pages";
import { charOwnerVerses, ownerVerseMap } from "@/lib/moms-bible/verse-text";
import { normalizePassageText } from "@/lib/typing-accuracy";
import { Fragment, useMemo, type ReactNode } from "react";

/** Mom's Bible marks on the text (storage chapter/verse keys). */
export type PassageMomsBible = {
  verseClass: (chapter: number, verse: number) => string | undefined;
  verseBadge: (chapter: number, verse: number) => string | null;
  /** Parents: tap a verse number to mark it or leave a note. */
  onVerseClick?: (chapter: number, verse: number) => void;
};

type Props = {
  bookSlug: string;
  bookName: string;
  segment: BibleReaderSegment;
  paneLabel: string;
  momsBible?: PassageMomsBible;
};

/** The memo hook's passage props (empty object when memos are off). */
type PassageProps = {
  passageCharClassName?: (index: number) => string | undefined;
  renderAfterPassageChar?: (index: number) => ReactNode;
  passageAddon?: ReactNode;
  onPassageElement?: (el: HTMLParagraphElement | null) => void;
};

function VerseNumber({
  label,
  badge,
  onClick,
}: {
  label: VerseLabel;
  badge?: string | null;
  onClick?: () => void;
}) {
  // Verses without their own official number read on as part of the previous verse.
  if (label.continued || label.douay) return null;
  const inner = (
    <>
      <span aria-hidden>{label.text}</span>
      <span className="sr-only">{`Verse ${label.text}. `}</span>
      {badge ? (
        <span className="mb-verse-badge" aria-hidden>
          {badge}
        </span>
      ) : null}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        id={label.id}
        data-verse={label.verse}
        className="bible-reader-verse bible-reader-verse--mb"
        onClick={onClick}
        title={`Mark verse ${label.text} or leave a note`}
      >
        {inner}
      </button>
    );
  }
  return (
    <span id={label.id} data-verse={label.verse} className="bible-reader-verse">
      {inner}
    </span>
  );
}

/**
 * Read-only chapter text (no typing). Characters keep the data-ci spans the memo hook anchors
 * to, and memo verse numbers stay Douay-Rheims; only the visible numbers are official ones.
 */
export function BibleChapterPassage({ bookSlug, bookName, segment, paneLabel, momsBible }: Props) {
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
  const owners = useMemo(
    () => ownerVerseMap(segment.verseMarkers, segment.verseLabels),
    [segment.verseMarkers, segment.verseLabels],
  );
  const mbOn = Boolean(momsBible);
  const charVerse = useMemo(
    () => (mbOn ? charOwnerVerses(target.length, segment.verseMarkers, owners) : null),
    [mbOn, target.length, segment.verseMarkers, owners],
  );
  const ch = segment.douayChapter;

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
                {label ? (
                  <VerseNumber
                    label={label}
                    badge={momsBible?.verseBadge(ch, label.verse)}
                    onClick={momsBible?.onVerseClick ? () => momsBible.onVerseClick!(ch, label.verse) : undefined}
                  />
                ) : null}
                <span data-ci={i} className={charClass(tp.passageCharClassName?.(i), charVerse, i, ch, momsBible)}>
                  {char}
                </span>
                {tp.renderAfterPassageChar?.(i)}
              </Fragment>
            );
          })}
        </p>
        {tp.passageAddon}
      </div>
      {memos.panel}
    </section>
  );
}

function charClass(
  memoClass: string | undefined,
  charVerse: Int32Array | null,
  i: number,
  chapter: number,
  mb: PassageMomsBible | undefined,
): string | undefined {
  const v = charVerse?.[i] ?? -1;
  const mbClass = mb && v > 0 ? mb.verseClass(chapter, v) : undefined;
  if (!mbClass) return memoClass;
  return memoClass ? `${memoClass} ${mbClass}` : mbClass;
}
