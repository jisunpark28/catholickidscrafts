export type ChapterNoteLocale = "en" | "ko";

export type ChapterNoteWord = {
  term: string;
  gloss: string;
};

export type ChapterNote = {
  summary: string;
  words?: ChapterNoteWord[];
};
