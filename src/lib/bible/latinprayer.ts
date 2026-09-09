import { getCatholicBookName } from "@/lib/bible/catholic-book-names";

const BASE = "https://latinprayer.org/bible";

/** Douay-Rheims API names (Josue, 1 Kings Samuel) → NAB/CBCK English (Joshua, 1 Samuel). */
function withCatholicEnglishName<T extends { slug: string; name: string }>(book: T): T {
  return { ...book, name: getCatholicBookName(book.slug, "en", book.name) };
}

/** Keep Douay-Rheims attribution, but use NAB book names in the citation line. */
export function catholicEnglishCitation(slug: string, citation: string, apiName: string): string {
  const catholic = getCatholicBookName(slug, "en", apiName);
  if (!apiName || catholic === apiName) return citation;
  if (citation.startsWith(`${apiName} `) || citation === apiName) {
    return catholic + citation.slice(apiName.length);
  }
  return citation;
}

export type BibleBookMeta = {
  order: number;
  name: string;
  slug: string;
  testament: "OT" | "NT";
  totalChapters: number;
};

type IndexResponse = {
  books: BibleBookMeta[];
};

type ChapterVerse = { verse: number; text: string; citation?: string };

export type BibleChapterResponse = {
  citation: string;
  verses: ChapterVerse[];
  meta: {
    book: { name: string; slug: string; totalChapters: number };
    chapter: number;
  };
};

let booksCache: BibleBookMeta[] | null = null;
let booksCacheAt = 0;
const CACHE_MS = 86_400_000;

export async function fetchBibleBooks(): Promise<BibleBookMeta[]> {
  const now = Date.now();
  if (booksCache && now - booksCacheAt < CACHE_MS) return booksCache;

  const res = await fetch(`${BASE}/index.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to load Bible book list");
  const data = (await res.json()) as IndexResponse;
  booksCache = data.books.map(withCatholicEnglishName);
  booksCacheAt = now;
  return booksCache;
}

export async function fetchBibleChapter(
  bookSlug: string,
  chapter: number,
): Promise<BibleChapterResponse> {
  const res = await fetch(`${BASE}/${bookSlug}/${chapter}.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Chapter not found");
  const data = (await res.json()) as {
    citation: string;
    verses: ChapterVerse[];
    _meta: {
      book: { name: string; slug: string; totalChapters: number };
      chapter: number;
    };
  };
  return {
    citation: catholicEnglishCitation(bookSlug, data.citation, data._meta.book.name),
    verses: data.verses,
    meta: {
      book: withCatholicEnglishName(data._meta.book),
      chapter: data._meta.chapter,
    },
  };
}

export function booksByTestament(books: BibleBookMeta[], testament: "OT" | "NT") {
  return books.filter((b) => b.testament === testament);
}

export function chapterPlainText(chapter: BibleChapterResponse): string {
  return chapter.verses.map((v) => v.text).join(" ");
}
