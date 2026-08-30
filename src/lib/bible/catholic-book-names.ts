/**
 * Catholic book names for UI copy (not scripture text).
 * Korean: 가톨릭 정식 명칭 (예: 마르코 — 개신교식 "마가" 사용 금지).
 */

import { CATHOLIC_BOOK_NAMES } from "@/lib/bible/catholic-book-names/locale-data";
import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

export { CATHOLIC_BOOK_NAMES, CATHOLIC_BOOK_NAMES_KO } from "@/lib/bible/catholic-book-names/locale-data";

const GOSPEL_SLUGS = new Set(["matthew", "mark", "luke", "john"]);

const GOSPEL_EVANGELIST: Record<PrayerLanguageCode, Record<string, string>> = {
  en: { matthew: "Matthew", mark: "Mark", luke: "Luke", john: "John" },
  es: { matthew: "Mateo", mark: "Marcos", luke: "Lucas", john: "Juan" },
  fr: { matthew: "Matthieu", mark: "Marc", luke: "Luc", john: "Jean" },
  ko: { matthew: "마태오", mark: "마르코", luke: "루카", john: "요한" },
  pt: { matthew: "Mateus", mark: "Marcos", luke: "Lucas", john: "João" },
  it: { matthew: "Matteo", mark: "Marco", luke: "Luca", john: "Giovanni" },
  de: { matthew: "Matthäus", mark: "Markus", luke: "Lukas", john: "Johannes" },
  pl: { matthew: "Mateusza", mark: "Marka", luke: "Łukasza", john: "Jana" },
  vi: { matthew: "Matthêô", mark: "Mác", luke: "Luca", john: "Gioan" },
  tl: { matthew: "Mateo", mark: "Marcos", luke: "Lucas", john: "Juan" },
};

const GOSPEL_LABEL: Record<PrayerLanguageCode, (name: string) => string> = {
  en: (n) => `Gospel according to ${n}`,
  es: (n) => `Evangelio según san ${n}`,
  fr: (n) => `Évangile selon saint ${n}`,
  ko: (n) => `${n}가 전한 복음`,
  pt: (n) => `Evangelho segundo São ${n}`,
  it: (n) => `Vangelo secondo ${n}`,
  de: (n) => `Evangelium nach ${n}`,
  pl: (n) => `Ewangelia według św. ${n}`,
  vi: (n) => `Tin Mừng theo thánh ${n}`,
  tl: (n) => `Ebanghelyo ayon kay ${n}`,
};

export function getCatholicBookName(
  bookSlug: string,
  locale: PrayerLanguageCode,
  fallback = "",
): string {
  return CATHOLIC_BOOK_NAMES[locale]?.[bookSlug] ?? CATHOLIC_BOOK_NAMES.en[bookSlug] ?? fallback;
}

export function catholicGospelLabel(
  bookSlug: string,
  locale: PrayerLanguageCode,
): string | null {
  if (!GOSPEL_SLUGS.has(bookSlug)) return null;
  const evangelist =
    GOSPEL_EVANGELIST[locale]?.[bookSlug] ?? GOSPEL_EVANGELIST.en[bookSlug];
  if (!evangelist) return null;
  const template = GOSPEL_LABEL[locale] ?? GOSPEL_LABEL.en;
  return template(evangelist);
}

/** @deprecated Use catholicGospelLabel(bookSlug, "ko") */
export function catholicGospelLabelKo(bookSlug: string): string | null {
  return catholicGospelLabel(bookSlug, "ko");
}

export function catholicChapterHeading(
  bookSlug: string,
  chapter: number,
  locale: PrayerLanguageCode,
  apiBookName: string,
): string {
  const book = getCatholicBookName(bookSlug, locale, apiBookName);
  if (locale === "ko") return `${book} ${chapter}장`;
  if (locale === "en") return `${book} — Chapter ${chapter}`;
  return `${book} — ${locale === "es" || locale === "pt" ? "capítulo" : locale === "fr" ? "chapitre" : locale === "de" ? "Kapitel" : locale === "pl" ? "rozdział" : locale === "vi" ? "chương" : locale === "tl" ? "kabanata" : locale === "it" ? "capitolo" : "Chapter"} ${chapter}`;
}

export function catholicChapterNotesTitle(
  bookSlug: string,
  chapter: number,
  locale: PrayerLanguageCode,
  apiBookName: string,
): string {
  const book = getCatholicBookName(bookSlug, locale, apiBookName);
  if (locale === "ko") return `${book} ${chapter}장 노트`;
  if (locale === "en") return `${book} — Chapter ${chapter} notes`;
  return `${book} — ${chapter}`;
}
