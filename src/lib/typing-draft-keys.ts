import { MODERNIZED_TEXT_VERSION } from "@/lib/bible/modernize-for-reading";

/** Stable keys for typing draft storage (separate from sticker progress). */
export const typingDraftKey = {
  bibleChapter(bookSlug: string, chapter: number) {
    return `bible:${bookSlug}:${chapter}:${MODERNIZED_TEXT_VERSION}`;
  },
  gospelReading(dateKey: string, readingKind: string) {
    return `gospel:${dateKey}:${readingKind}`;
  },
  massReading(dateKey: string, readingKind: string) {
    return `mass:${dateKey}:${readingKind}`;
  },
};
