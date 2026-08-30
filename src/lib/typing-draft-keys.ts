import {
  MODERNIZED_TEXT_VERSION,
  usesModernizedReading,
} from "@/lib/bible/modernize-for-reading";

/** Stable keys for typing draft storage (separate from sticker progress). */
export const typingDraftKey = {
  bibleChapter(bookSlug: string, chapter: number) {
    const base = `bible:${bookSlug}:${chapter}`;
    if (usesModernizedReading(bookSlug)) {
      return `${base}:${MODERNIZED_TEXT_VERSION}`;
    }
    return base;
  },
  gospelReading(dateKey: string, readingKind: string) {
    return `gospel:${dateKey}:${readingKind}`;
  },
  massReading(dateKey: string, readingKind: string) {
    return `mass:${dateKey}:${readingKind}`;
  },
};
