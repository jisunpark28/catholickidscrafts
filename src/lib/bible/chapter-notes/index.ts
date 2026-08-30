import { getMarkChapterNote } from "@/lib/bible/chapter-notes/mark";
import type { ChapterNote, ChapterNoteLocale } from "@/lib/bible/chapter-notes/types";
import { usesModernizedReading } from "@/lib/bible/modernize-for-reading";

export type { ChapterNote, ChapterNoteLocale };

export const CHAPTER_NOTE_LOCALES: readonly ChapterNoteLocale[] = ["en", "ko"];

export const CHAPTER_NOTE_LOCALE_LABELS: Record<ChapterNoteLocale, string> = {
  en: "English",
  ko: "한국어",
};

export const BIBLE_NOTES_LANG_STORAGE_KEY = "ckc_bible_notes_lang";

export function getChapterNote(
  bookSlug: string,
  chapter: number,
  locale: ChapterNoteLocale,
): ChapterNote | null {
  if (!usesModernizedReading(bookSlug)) return null;
  if (bookSlug === "mark") return getMarkChapterNote(chapter, locale);
  return null;
}

export function hasChapterNotes(bookSlug: string, chapter: number): boolean {
  return getChapterNote(bookSlug, chapter, "en") !== null;
}
