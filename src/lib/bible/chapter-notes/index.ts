import { getMarkChapterNote } from "@/lib/bible/chapter-notes/mark";
import type { ChapterNote, ChapterNoteLocale } from "@/lib/bible/chapter-notes/types";
import {
  DEFAULT_PRAYER_LANGUAGE,
  isPrayerLanguageCode,
} from "@/lib/prayers/prayer-languages";

export type { ChapterNote, ChapterNoteLocale };

/** Shared with prayers — one parish language preference across the site. */
export const BIBLE_LANG_STORAGE_KEY = "prayer-lang";

export function readBibleUiLanguage(): ChapterNoteLocale {
  if (typeof window === "undefined") return DEFAULT_PRAYER_LANGUAGE;
  const stored = window.localStorage.getItem(BIBLE_LANG_STORAGE_KEY);
  return stored && isPrayerLanguageCode(stored) ? stored : DEFAULT_PRAYER_LANGUAGE;
}

export function writeBibleUiLanguage(locale: ChapterNoteLocale): void {
  window.localStorage.setItem(BIBLE_LANG_STORAGE_KEY, locale);
}

export function getChapterNote(
  bookSlug: string,
  chapter: number,
  locale: ChapterNoteLocale,
): ChapterNote | null {
  if (bookSlug === "mark") return getMarkChapterNote(chapter, locale);
  return null;
}

export function hasChapterNotes(bookSlug: string, chapter: number): boolean {
  return getChapterNote(bookSlug, chapter, DEFAULT_PRAYER_LANGUAGE) !== null;
}
