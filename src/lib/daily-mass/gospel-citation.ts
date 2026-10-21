/** A Gospel passage resolved from a lectionary citation such as "Luke 12:39-48". */
export type GospelPassage = {
  bookSlug: "matthew" | "mark" | "luke" | "john";
  bookName: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

const BOOKS: { slug: GospelPassage["bookSlug"]; name: string; re: RegExp }[] = [
  { slug: "matthew", name: "Matthew", re: /^(?:matthew|matt?|mt)\.?$/i },
  { slug: "mark", name: "Mark", re: /^(?:mark|mk|mrk)\.?$/i },
  { slug: "luke", name: "Luke", re: /^(?:luke|lk|luk)\.?$/i },
  { slug: "john", name: "John", re: /^(?:john|jn|jhn)\.?$/i },
];

/**
 * Parse a Gospel citation into one chapter and verse range. Handles the forms the
 * lectionary uses: "Luke 12:39-48", "Matthew 5:1-12a", "Jn 6:51", "Mark 1:1-8, 14-15"
 * (first chapter, first to last verse), "Luke 9:51-10:12" (kept to the first chapter).
 * Returns null for anything else so callers can skip verse-anchored saving.
 */
export function parseGospelCitation(raw: string | null | undefined): GospelPassage | null {
  if (!raw) return null;
  const text = raw.trim().replace(/[\u2013\u2014]/g, "-").replace(/\s+/g, " ");
  const m = /^(?:the )?(?:gospel (?:of|according to) )?(?:saint |st\.? )?([a-z]+\.?)\s+(\d{1,3})\s*[:,.]\s*(.+)$/i.exec(text);
  if (!m) return null;
  const book = BOOKS.find((b) => b.re.test(m[1]!));
  if (!book) return null;
  const chapter = Number(m[2]);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 28) return null;

  const verses = m[3]!.split(";")[0]!;
  // "9:51-10:12": the range runs into the next chapter, so keep it to the end of this one (clamped later).
  const crossesChapter = /^\d{1,3}[a-d]?\s*-\s*\d{1,3}\s*:/i.test(verses);
  // "1:1-16, 18-23" stays in one chapter; drop any later "N:..." segment from another chapter.
  const cut = verses.search(/,\s*\d{1,3}\s*:/);
  const own = crossesChapter ? verses.split("-")[0]! : cut >= 0 ? verses.slice(0, cut) : verses;
  const nums = [...own.matchAll(/(\d{1,3})[a-d]?/gi)].map((x) => Number(x[1]));
  const startVerse = nums[0];
  if (!startVerse) return null;
  const endVerse = crossesChapter ? 200 : Math.max(...nums);
  if (endVerse < startVerse || endVerse > 200) return null;
  return { bookSlug: book.slug, bookName: book.name, chapter, startVerse, endVerse };
}

export function formatGospelPassage(p: { bookSlug: string; chapter: number; startVerse: number; endVerse: number }): string {
  const name = BOOKS.find((b) => b.slug === p.bookSlug)?.name ?? p.bookSlug;
  const range = p.endVerse > p.startVerse ? `${p.startVerse}-${p.endVerse}` : `${p.startVerse}`;
  return `${name} ${p.chapter}:${range}`;
}

export function isGospelSlug(slug: string): slug is GospelPassage["bookSlug"] {
  return BOOKS.some((b) => b.slug === slug);
}
