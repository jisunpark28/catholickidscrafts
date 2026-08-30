"use client";

import {
  getChapterNote,
  hasChapterNotes,
  type ChapterNoteLocale,
} from "@/lib/bible/chapter-notes";
import { bibleUiLabels } from "@/lib/bible/bible-ui-labels";
import {
  catholicChapterNotesTitle,
  catholicGospelLabel,
  getCatholicBookName,
} from "@/lib/bible/catholic-book-names";
import { useMemo, useState } from "react";

type NotesProps = {
  bookSlug: string;
  apiBookName: string;
  chapter: number;
  locale: ChapterNoteLocale;
};

export function BibleChapterReadingNotes({
  bookSlug,
  apiBookName,
  chapter,
  locale,
}: NotesProps) {
  const [open, setOpen] = useState(false);
  const labels = bibleUiLabels(locale);

  const note = useMemo(
    () => getChapterNote(bookSlug, chapter, locale),
    [bookSlug, chapter, locale],
  );

  if (!hasChapterNotes(bookSlug, chapter) || !note) {
    return null;
  }

  const book = getCatholicBookName(bookSlug, locale, apiBookName);
  const notesTitle = catholicChapterNotesTitle(bookSlug, chapter, locale, apiBookName);
  const gospelLabel = catholicGospelLabel(bookSlug, locale);

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <button
        type="button"
        className="text-left text-sm font-semibold text-[var(--color-ink)]"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {notesTitle || labels.chapterNotesTitle(book, chapter)}{" "}
        <span className="font-normal text-[var(--color-muted)]">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-sm text-[var(--color-ink)]" lang={locale}>
          {gospelLabel && (
            <p className="text-xs font-medium text-[var(--color-muted)]">{gospelLabel}</p>
          )}
          <p className="leading-relaxed text-[var(--color-muted)]">{note.summary}</p>
          {note.words && note.words.length > 0 && (
            <ul className="space-y-2">
              {note.words.map((item) => (
                <li key={item.term}>
                  <span className="font-semibold text-[var(--color-ink)]">{item.term}</span>
                  <span className="text-[var(--color-muted)]"> — {item.gloss}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-[var(--color-muted)]">{labels.disclaimer}</p>
        </div>
      )}
    </section>
  );
}
