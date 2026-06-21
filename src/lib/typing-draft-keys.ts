/** Stable keys for typing draft storage (separate from sticker progress). */
export const typingDraftKey = {
  bibleChapter(bookSlug: string, chapter: number) {
    return `bible:${bookSlug}:${chapter}`;
  },
  gospelReading(dateKey: string, readingKind: string) {
    return `gospel:${dateKey}:${readingKind}`;
  },
  massReading(dateKey: string, readingKind: string) {
    return `mass:${dateKey}:${readingKind}`;
  },
};
