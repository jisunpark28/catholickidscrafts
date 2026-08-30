import { getMarkChapterNote } from "@/lib/bible/chapter-notes/mark";
import type { ChapterNote, ChapterNoteLocale } from "@/lib/bible/chapter-notes/types";
import {
  getBibleBookCatalogEntry,
  isValidBibleChapter,
} from "@/lib/bible/chapter-notes/catalog";
import { buildTemplateChapterNote } from "@/lib/bible/chapter-notes/template-note";
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
  apiBookName: string,
): ChapterNote | null {
  if (!isValidBibleChapter(bookSlug, chapter)) return null;

  if (bookSlug === "mark") {
    const manual = getMarkChapterNote(chapter, locale);
    if (manual) return manual;
  }

  return buildTemplateChapterNote(bookSlug, chapter, locale, apiBookName);
}

export function hasChapterNotes(bookSlug: string, chapter: number): boolean {
  return isValidBibleChapter(bookSlug, chapter);
}

export function getBookChapterCount(bookSlug: string): number {
  return getBibleBookCatalogEntry(bookSlug)?.totalChapters ?? 0;
}
