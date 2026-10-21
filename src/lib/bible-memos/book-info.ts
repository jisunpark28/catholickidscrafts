import { CATHOLIC_BOOK_NAMES_EN } from "@/lib/bible/catholic-book-names/locale-data";

const BOOK_ORDER = Object.keys(CATHOLIC_BOOK_NAMES_EN);

/** Attach English book name and canonical order to a memo. */
export function withBookInfo<T extends { bookSlug: string }>(m: T): T & { bookName: string; bookOrder: number } {
  const idx = BOOK_ORDER.indexOf(m.bookSlug);
  return { ...m, bookName: CATHOLIC_BOOK_NAMES_EN[m.bookSlug] ?? m.bookSlug, bookOrder: idx === -1 ? 999 : idx };
}
