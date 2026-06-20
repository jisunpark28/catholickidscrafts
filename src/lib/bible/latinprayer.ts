const BASE = "https://latinprayer.org/bible";

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
  booksCache = data.books;
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
    citation: data.citation,
    verses: data.verses,
    meta: {
      book: data._meta.book,
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
