import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

export type ChapterNoteLocale = PrayerLanguageCode;

export type ChapterNoteWord = {
  term: string;
  gloss: string;
};

export type ChapterNote = {
  summary: string;
  words?: ChapterNoteWord[];
};
