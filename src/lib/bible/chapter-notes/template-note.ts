import { getCatholicBookName } from "@/lib/bible/catholic-book-names";
import { getBibleBookCatalogEntry } from "@/lib/bible/chapter-notes/catalog";
import {
  BOOK_NOTE_CATEGORY,
  CATEGORY_NOTE_BLURBS,
  chapterNoteSummary,
} from "@/lib/bible/chapter-notes/category-blurbs";
import type { ChapterNote } from "@/lib/bible/chapter-notes/types";
import { getBookSpecificBlurb } from "@/lib/bible/chapter-notes/book-blurbs";
import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";
import { DEFAULT_PRAYER_LANGUAGE } from "@/lib/prayers/prayer-languages";

export function buildTemplateChapterNote(
  bookSlug: string,
  chapter: number,
  locale: PrayerLanguageCode,
  apiBookName: string,
): ChapterNote | null {
  const meta = getBibleBookCatalogEntry(bookSlug);
  if (!meta) return null;

  const bookName = getCatholicBookName(bookSlug, locale, apiBookName);
  const category = BOOK_NOTE_CATEGORY[bookSlug];
  const blurb =
    getBookSpecificBlurb(bookSlug, locale) ??
    getBookSpecificBlurb(bookSlug, DEFAULT_PRAYER_LANGUAGE) ??
    (category ? CATEGORY_NOTE_BLURBS[category][locale] : "") ??
    CATEGORY_NOTE_BLURBS.historical[locale];

  return {
    summary: chapterNoteSummary(locale, bookName, chapter, meta.totalChapters, blurb),
    words: getBookGlossary(bookSlug, locale),
  };
}

/** Optional per-book glossary terms (localized). */
function getBookGlossary(
  bookSlug: string,
  locale: PrayerLanguageCode,
): ChapterNote["words"] {
  const glossary = BOOK_GLOSSARY[bookSlug];
  if (!glossary) return undefined;
  return glossary[locale] ?? glossary[DEFAULT_PRAYER_LANGUAGE];
}

const BOOK_GLOSSARY: Partial<
  Record<string, Partial<Record<PrayerLanguageCode, NonNullable<ChapterNote["words"]>>>>
> = {
  genesis: {
    en: [
      { term: "covenant", gloss: "God's sacred promise with his people." },
      { term: "creation", gloss: "God made the world good at the beginning." },
    ],
    ko: [
      { term: "언약", gloss: "하나님과 백성 사이의 거룩한 약속입니다." },
      { term: "창조", gloss: "하나님께서 처음에 세상을 선하게 만드셨습니다." },
    ],
    es: [
      { term: "alianza", gloss: "La promesa sagrada de Dios con su pueblo." },
      { term: "creación", gloss: "Dios hizo el mundo bueno al principio." },
    ],
    fr: [
      { term: "alliance", gloss: "La promesse sacrée de Dieu avec son peuple." },
      { term: "création", gloss: "Dieu a fait le monde bon au commencement." },
    ],
  },
  mark: {
    en: [
      { term: "Gospel", gloss: "Good News of Jesus Christ." },
      { term: "disciple", gloss: "A follower who learns from Jesus." },
    ],
    ko: [
      { term: "복음", gloss: "예수 그리스도의 좋은 소식입니다." },
      { term: "제자", gloss: "예수님을 따르며 배우는 사람입니다." },
    ],
    es: [
      { term: "Evangelio", gloss: "Buena Nueva de Jesucristo." },
      { term: "discípulo", gloss: "Quien sigue y aprende de Jesús." },
    ],
    fr: [
      { term: "Évangile", gloss: "Bonne Nouvelle de Jésus-Christ." },
      { term: "disciple", gloss: "Celui qui suit et apprend de Jésus." },
    ],
  },
};
