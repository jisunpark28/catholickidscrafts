"use client";

import type { BibleReaderSegment } from "@/components/bible/BibleChapterReadClient";
import type { VerseLabel } from "@/lib/bible/chapter-pages";
import { ownerVerseMap } from "@/lib/moms-bible/verse-text";
import { normalizePassageText } from "@/lib/typing-accuracy";
import { Fragment, useMemo, type KeyboardEvent, type ReactNode } from "react";

/** Mom's Bible hooks into the text (storage chapter/verse keys). */
export type PassageMomsBible = {
  verseClass: (chapter: number, verse: number) => string | undefined;
  /** Parents: tap a verse to mark it or leave a note. */
  onVerseClick?: (chapter: number, verse: number) => void;
  /** Rendered right after a verse block (the floating palette for the selected verse). */
  renderAfterVerse?: (chapter: number, verse: number) => ReactNode;
};

type Props = {
  segment: BibleReaderSegment;
  /** Shown only when a page joins several text sections (e.g. Psalms 9–10). */
  paneLabel: string | null;
  momsBible?: PassageMomsBible;
};

type VerseBlock = { verse: number; label: VerseLabel | null; text: string };

/**
 * Verse blocks for display: storage verses without their own official number ("continued")
 * read on inside the previous numbered verse, so every block carries an official number.
 */
function verseBlocks(segment: BibleReaderSegment): VerseBlock[] {
  const text = normalizePassageText(segment.text);
  const markers = [...segment.verseMarkers].sort((a, b) => a.start - b.start);
  if (!text) return [];
  if (markers.length === 0) return [{ verse: 0, label: null, text }];
  const owners = ownerVerseMap(markers, segment.verseLabels);
  const byVerse = new Map(segment.verseLabels.map((l) => [l.verse, l]));
  const blocks: VerseBlock[] = [];
  if (markers[0]!.start > 0) blocks.push({ verse: 0, label: null, text: text.slice(0, markers[0]!.start).trim() });
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i]!;
    const end = i + 1 < markers.length ? markers[i + 1]!.start : text.length;
    const piece = text.slice(m.start, end).trim();
    const owner = owners.get(m.verse) ?? m.verse;
    const last = blocks[blocks.length - 1];
    if (last && last.verse === owner) {
      last.text = `${last.text} ${piece}`;
      continue;
    }
    const l = byVerse.get(owner);
    blocks.push({ verse: owner, label: l && !l.continued && !l.douay ? l : null, text: piece });
  }
  return blocks;
}

/** Read-only chapter text (no typing): one block per official verse, Mom's Bible marks on top. */
export function BibleChapterPassage({ segment, paneLabel, momsBible }: Props) {
  const blocks = useMemo(() => verseBlocks(segment), [segment]);
  const ch = segment.douayChapter;

  if (blocks.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No text available for this chapter.</p>;
  }

  return (
    <section className="bible-reader__card">
      {paneLabel && <p className="bible-reader__pane-label">{paneLabel}</p>}
      {blocks.map((b, idx) => {
        const tap = b.verse > 0 && momsBible?.onVerseClick ? () => momsBible.onVerseClick!(ch, b.verse) : undefined;
        const cls = b.verse > 0 ? momsBible?.verseClass(ch, b.verse) : undefined;
        const onKey = tap
          ? (e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tap();
              }
            }
          : undefined;
        return (
          <Fragment key={`${b.verse}-${idx}`}>
            <span
              id={b.label?.id}
              data-verse={b.verse || undefined}
              className={`bible-reader__verse${tap ? " bible-reader__verse--tap" : ""}${cls ? ` ${cls}` : ""}`}
              role={tap ? "button" : undefined}
              tabIndex={tap ? 0 : undefined}
              onClick={tap}
              onKeyDown={onKey}
            >
              {b.label && (
                <span className="bible-reader-verse">
                  <span aria-hidden>{b.label.text}</span>
                  <span className="sr-only">{`Verse ${b.label.text}. `}</span>
                </span>
              )}
              {b.text}
            </span>
            {b.verse > 0 && momsBible?.renderAfterVerse?.(ch, b.verse)}
          </Fragment>
        );
      })}
    </section>
  );
}
