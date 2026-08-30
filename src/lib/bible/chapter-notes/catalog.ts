/** Catholic 73-book canon — chapter counts match latinprayer.org. */
export type BibleBookCatalogEntry = {
  slug: string;
  totalChapters: number;
  testament: "OT" | "NT";
};

export const BIBLE_BOOK_CATALOG: readonly BibleBookCatalogEntry[] = [
  { slug: "genesis", totalChapters: 50, testament: "OT" },
  { slug: "exodus", totalChapters: 40, testament: "OT" },
  { slug: "leviticus", totalChapters: 27, testament: "OT" },
  { slug: "numbers", totalChapters: 36, testament: "OT" },
  { slug: "deuteronomy", totalChapters: 34, testament: "OT" },
  { slug: "josue", totalChapters: 24, testament: "OT" },
  { slug: "judges", totalChapters: 21, testament: "OT" },
  { slug: "ruth", totalChapters: 4, testament: "OT" },
  { slug: "1-kings-samuel", totalChapters: 31, testament: "OT" },
  { slug: "2-kings-samuel", totalChapters: 24, testament: "OT" },
  { slug: "3-kings", totalChapters: 22, testament: "OT" },
  { slug: "4-kings", totalChapters: 25, testament: "OT" },
  { slug: "1-paralipomenon", totalChapters: 29, testament: "OT" },
  { slug: "2-paralipomenon", totalChapters: 36, testament: "OT" },
  { slug: "1-esdras", totalChapters: 10, testament: "OT" },
  { slug: "2-esdras-nehemias", totalChapters: 13, testament: "OT" },
  { slug: "tobias", totalChapters: 14, testament: "OT" },
  { slug: "judith", totalChapters: 16, testament: "OT" },
  { slug: "esther", totalChapters: 16, testament: "OT" },
  { slug: "job", totalChapters: 42, testament: "OT" },
  { slug: "psalms", totalChapters: 150, testament: "OT" },
  { slug: "proverbs", totalChapters: 31, testament: "OT" },
  { slug: "ecclesiastes", totalChapters: 12, testament: "OT" },
  { slug: "canticle-of-canticles", totalChapters: 8, testament: "OT" },
  { slug: "wisdom", totalChapters: 19, testament: "OT" },
  { slug: "ecclesiasticus", totalChapters: 51, testament: "OT" },
  { slug: "isaias", totalChapters: 66, testament: "OT" },
  { slug: "jeremias", totalChapters: 52, testament: "OT" },
  { slug: "lamentations", totalChapters: 5, testament: "OT" },
  { slug: "baruch", totalChapters: 6, testament: "OT" },
  { slug: "ezechiel", totalChapters: 48, testament: "OT" },
  { slug: "daniel", totalChapters: 14, testament: "OT" },
  { slug: "osee", totalChapters: 14, testament: "OT" },
  { slug: "joel", totalChapters: 3, testament: "OT" },
  { slug: "amos", totalChapters: 9, testament: "OT" },
  { slug: "abdias", totalChapters: 1, testament: "OT" },
  { slug: "jonas", totalChapters: 4, testament: "OT" },
  { slug: "micheas", totalChapters: 7, testament: "OT" },
  { slug: "nahum", totalChapters: 3, testament: "OT" },
  { slug: "habacuc", totalChapters: 3, testament: "OT" },
  { slug: "sophonias", totalChapters: 3, testament: "OT" },
  { slug: "aggeus", totalChapters: 2, testament: "OT" },
  { slug: "zacharias", totalChapters: 14, testament: "OT" },
  { slug: "malachias", totalChapters: 4, testament: "OT" },
  { slug: "1-machabees", totalChapters: 16, testament: "OT" },
  { slug: "2-machabees", totalChapters: 15, testament: "OT" },
  { slug: "matthew", totalChapters: 28, testament: "NT" },
  { slug: "mark", totalChapters: 16, testament: "NT" },
  { slug: "luke", totalChapters: 24, testament: "NT" },
  { slug: "john", totalChapters: 21, testament: "NT" },
  { slug: "acts", totalChapters: 28, testament: "NT" },
  { slug: "romans", totalChapters: 16, testament: "NT" },
  { slug: "1-corinthians", totalChapters: 16, testament: "NT" },
  { slug: "2-corinthians", totalChapters: 13, testament: "NT" },
  { slug: "galatians", totalChapters: 6, testament: "NT" },
  { slug: "ephesians", totalChapters: 6, testament: "NT" },
  { slug: "philippians", totalChapters: 4, testament: "NT" },
  { slug: "colossians", totalChapters: 4, testament: "NT" },
  { slug: "1-thessalonians", totalChapters: 5, testament: "NT" },
  { slug: "2-thessalonians", totalChapters: 3, testament: "NT" },
  { slug: "1-timothy", totalChapters: 6, testament: "NT" },
  { slug: "2-timothy", totalChapters: 4, testament: "NT" },
  { slug: "titus", totalChapters: 3, testament: "NT" },
  { slug: "philemon", totalChapters: 1, testament: "NT" },
  { slug: "hebrews", totalChapters: 13, testament: "NT" },
  { slug: "james", totalChapters: 5, testament: "NT" },
  { slug: "1-peter", totalChapters: 5, testament: "NT" },
  { slug: "2-peter", totalChapters: 3, testament: "NT" },
  { slug: "1-john", totalChapters: 5, testament: "NT" },
  { slug: "2-john", totalChapters: 1, testament: "NT" },
  { slug: "3-john", totalChapters: 1, testament: "NT" },
  { slug: "jude", totalChapters: 1, testament: "NT" },
  { slug: "apocalypse", totalChapters: 22, testament: "NT" },
] as const;

const CATALOG_BY_SLUG = new Map(BIBLE_BOOK_CATALOG.map((book) => [book.slug, book]));

export function getBibleBookCatalogEntry(bookSlug: string): BibleBookCatalogEntry | undefined {
  return CATALOG_BY_SLUG.get(bookSlug);
}

export function isValidBibleChapter(bookSlug: string, chapter: number): boolean {
  const entry = getBibleBookCatalogEntry(bookSlug);
  if (!entry) return false;
  return Number.isInteger(chapter) && chapter >= 1 && chapter <= entry.totalChapters;
}
