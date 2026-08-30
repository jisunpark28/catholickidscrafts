"use client";

import {
  CHAPTER_NOTE_LOCALE_LABELS,
  CHAPTER_NOTE_LOCALES,
  getChapterNote,
  hasChapterNotes,
  writeChapterNotesLocale,
  type ChapterNoteLocale,
} from "@/lib/bible/chapter-notes";
import {
  catholicChapterNotesTitle,
  catholicGospelLabelKo,
} from "@/lib/bible/catholic-book-names";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { usesModernizedReading } from "@/lib/bible/modernize-for-reading";
import { useMemo, useState } from "react";

type NotesProps = {
  bookSlug: string;
  chapter: number;
  locale: ChapterNoteLocale;
  onLocaleChange: (locale: ChapterNoteLocale) => void;
};

export function BibleChapterReadingNotes({
  bookSlug,
  chapter,
  locale,
  onLocaleChange,
}: NotesProps) {
  const copy = useSiteCopy();
  const [open, setOpen] = useState(false);

  const note = useMemo(
    () => getChapterNote(bookSlug, chapter, locale),
    [bookSlug, chapter, locale],
  );

  if (!usesModernizedReading(bookSlug) || !hasChapterNotes(bookSlug, chapter) || !note) {
    return null;
  }

  const handleLocaleChange = (next: ChapterNoteLocale) => {
    onLocaleChange(next);
    writeChapterNotesLocale(next);
  };

  const notesTitle = catholicChapterNotesTitle(
    bookSlug,
    chapter,
    locale,
    textFromCopy(copy, "bible.notes.title", "Chapter notes"),
  );
  const gospelLabelKo = locale === "ko" ? catholicGospelLabelKo(bookSlug) : null;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="text-left text-sm font-semibold text-[var(--color-ink)]"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {notesTitle}{" "}
          <span className="font-normal text-[var(--color-muted)]">{open ? "▾" : "▸"}</span>
        </button>
        <div
          className="inline-flex rounded-lg border border-[var(--color-border)] p-0.5 text-xs"
          role="group"
          aria-label={textFromCopy(copy, "bible.notes.lang_group", "Notes language")}
        >
          {CHAPTER_NOTE_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              className={`rounded-md px-2.5 py-1 transition ${
                locale === code
                  ? "bg-[var(--color-accent-soft)] font-semibold text-[var(--color-ink)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
              onClick={() => handleLocaleChange(code)}
              aria-pressed={locale === code}
            >
              {CHAPTER_NOTE_LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-3 text-sm text-[var(--color-ink)]">
          {gospelLabelKo && (
            <p className="text-xs font-medium text-[var(--color-muted)]">{gospelLabelKo}</p>
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
          <p className="text-xs text-[var(--color-muted)]">
            {textFromCopy(
              copy,
              locale === "ko" ? "bible.notes.disclaimer.ko" : "bible.notes.disclaimer",
              locale === "ko"
                ? "이 설명은 이해를 돕기 위한 것이며, 타이핑하는 성경 본문이 아닙니다."
                : "Notes help understanding; they are not part of the Bible text you type.",
            )}
          </p>
        </div>
      )}
    </section>
  );
}

export function BibleModernizedReadingNotice({
  bookSlug,
  locale,
}: {
  bookSlug: string;
  locale: ChapterNoteLocale;
}) {
  const copy = useSiteCopy();
  if (!usesModernizedReading(bookSlug)) return null;

  const isKo = locale === "ko";

  return (
    <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-950">
      {textFromCopy(
        copy,
        isKo ? "bible.reading.modernized_notice.ko" : "bible.reading.modernized_notice",
        isKo
          ? "두아이-랭스 본문을 읽기 쉽게 맞춤법·어휘만 가볍게 다듬었습니다. 뜻은 바꾸지 않았습니다."
          : "Douay-Rheims text with spelling and wording lightly updated for easier reading. Meaning is unchanged.",
      )}
    </p>
  );
}
