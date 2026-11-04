/**
 * Chapter pages for the Old/New Testament reader, numbered the official Catholic way (NABRE).
 *
 * The text, memos, discussion threads and progress stay keyed by the Douay-Rheims chapter the
 * site reads from latinprayer.org. A reader page shows one or more whole Douay chapters, so
 * memo character offsets keep working. Each Douay chapter belongs to the NABRE chapter that
 * holds most of its verses (Douay Psalm 33 -> Psalm 34). URLs use that NABRE chapter:
 *   /bible/read/psalms/34       Douay Psalm 33
 *   /bible/read/psalms/116      Douay Psalms 114 + 115
 *   /bible/read/psalms/114      Douay Psalm 113 (official Psalms 114 and 115)
 *   /bible/read/psalms/10       -> /bible/read/psalms/9#v-10-1 (Douay 9 holds Psalms 9 and 10)
 *   /bible/read/psalms/34?douay=1 -> /bible/read/psalms/35 (old Douay-numbered link)
 *   /bible/read/joshua/1        -> /bible/read/josue/1 (NABRE book id alias)
 *   /bible/read/malachias/4     404
 */
import {
  NABRE_BOOK_TO_SLUG,
  SLUG_TO_NABRE_BOOK,
  douayChapterCount,
  douayToNabre,
  douayVerseCount,
  isDouaySlug,
  isNabreBookId,
  isValidDouayChapter,
  nabreToDouay,
  nabreVerseCount,
  type DouaySlug,
  type NabreBookId,
  type NabreChapter,
} from "@/lib/bible/ref-map";

const ESTHER_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

/** URL form of a NABRE chapter label ("34", "a" for Esther A). */
export function chapterUrlPart(label: string): string {
  return label.toLowerCase();
}

export function readHref(slug: string, label: string, hash?: string): string {
  return `/bible/read/${slug}/${chapterUrlPart(label)}${hash ? `#${hash}` : ""}`;
}

/** Element id of a verse marker, e.g. "v-34-19" or "v-a-3". */
export function verseAnchorId(label: string, verse: number): string {
  return `v-${chapterUrlPart(label)}-${verse}`;
}

function toNabreChapter(book: NabreBookId, label: string): NabreChapter | null {
  if (/^\d+$/.test(label)) return Number(label);
  const upper = label.toUpperCase();
  if (book === "esther" && (ESTHER_LETTERS as readonly string[]).includes(upper)) {
    return upper as NabreChapter;
  }
  return null;
}

/** NABRE chapter labels of a book in reading order (Esther: 1-10, then A-F). */
export function nabreChapterLabels(book: NabreBookId): string[] {
  const out: string[] = [];
  for (let c = 1; c <= 150; c++) {
    if (book === "esther" && c > 40) break;
    if (nabreVerseCount(book, c) > 0) out.push(String(c));
  }
  if (book === "esther") {
    for (const l of ESTHER_LETTERS) if (nabreVerseCount(book, l) > 0) out.push(l);
  }
  return out;
}

type BookPages = {
  /** primary[d - 1] = NABRE label that Douay chapter d is shown under. */
  primary: string[];
  /** NABRE label -> Douay chapters shown on its page (ascending). */
  pages: Map<string, number[]>;
  /** NABRE labels with no page of their own -> Douay chapter holding their first verse. */
  orphans: Map<string, { douayChapter: number; hash?: string }>;
  labels: string[];
};

const cache = new Map<DouaySlug, BookPages>();

/** Every verse of official chapter `label` lives in Douay chapter `douayChapter`. */
function wholeChapterIn(book: NabreBookId, label: string, douayChapter: number): boolean {
  const ch = toNabreChapter(book, label);
  if (ch === null) return false;
  const n = nabreVerseCount(book, ch);
  if (n === 0) return false;
  for (let v = 1; v <= n; v++) {
    const m = nabreToDouay(book, ch, v);
    if (m && m.chapter !== douayChapter) return false;
  }
  return true;
}

function computeBook(slug: DouaySlug): BookPages {
  const book = SLUG_TO_NABRE_BOOK[slug];
  const primary: string[] = [];
  const pages = new Map<string, number[]>();
  for (let d = 1; d <= douayChapterCount(slug); d++) {
    const counts = new Map<string, number>();
    for (let v = 1; v <= douayVerseCount(slug, d); v++) {
      const m = douayToNabre(slug, d, v);
      if (!m) continue;
      const k = String(m.chapter);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    // A Douay chapter that holds a whole official chapter is shown under the first such
    // chapter (Douay Psalm 9 -> Psalm 9, Douay 113 -> Psalm 114); otherwise under the one
    // with most of its verses (Douay Exodus 8 starts with Exodus 7:26 but is Exodus 8).
    let best = [...counts.keys()].find((k) => wholeChapterIn(book, k, d)) ?? String(d);
    if (!counts.has(best)) {
      let bestCount = 0;
      for (const [k, c] of counts) {
        if (c > bestCount) {
          best = k;
          bestCount = c;
        }
      }
    }
    primary.push(best);
    pages.set(best, [...(pages.get(best) ?? []), d]);
  }
  const labels = nabreChapterLabels(book);
  const orphans = new Map<string, { douayChapter: number; hash?: string }>();
  for (const label of labels) {
    if (pages.has(label)) continue;
    const ch = toNabreChapter(book, label);
    if (ch === null) continue;
    for (let v = 1; v <= nabreVerseCount(book, ch); v++) {
      const m = nabreToDouay(book, ch, v);
      if (!m) continue;
      const back = douayToNabre(slug, m.chapter, m.verse);
      const hash =
        back && String(back.chapter) === label ? verseAnchorId(label, back.verse) : undefined;
      orphans.set(label, { douayChapter: m.chapter, hash });
      break;
    }
  }
  return { primary, pages, orphans, labels };
}

function bookPages(slug: DouaySlug): BookPages {
  let b = cache.get(slug);
  if (!b) {
    b = computeBook(slug);
    cache.set(slug, b);
  }
  return b;
}

/** NABRE chapter label a Douay chapter is shown under (Douay Psalm 22 -> "23"). */
export function nabreLabelForDouayChapter(slug: DouaySlug, douayChapter: number): string | null {
  return bookPages(slug).primary[douayChapter - 1] ?? null;
}

/** Reader URL for a Douay-numbered chapter (memos, progress, old links). */
export function readHrefForDouay(slug: string, douayChapter: number, douayVerse?: number): string {
  if (!isDouaySlug(slug)) return `/bible/read/${slug}/${douayChapter}`;
  const label = nabreLabelForDouayChapter(slug, douayChapter) ?? String(douayChapter);
  let hash: string | undefined;
  if (douayVerse) {
    const m = douayToNabre(slug, douayChapter, douayVerse);
    if (m && m.quality !== "approximate") hash = verseAnchorId(String(m.chapter), m.verse);
  }
  return readHref(slug, label, hash);
}

export type ChapterGridItem = {
  label: string;
  href: string;
  /** Douay chapters whose progress counts for this cell. */
  douayChapters: number[];
};

/** One cell per official chapter (Psalms: 150), for the book hub sticker grid. */
export function chapterGrid(slug: DouaySlug): ChapterGridItem[] {
  const b = bookPages(slug);
  return b.labels.map((label) => {
    const page = b.pages.get(label);
    if (page) return { label, href: readHref(slug, label), douayChapters: page };
    const o = b.orphans.get(label);
    if (!o) return { label, href: readHref(slug, label), douayChapters: [] };
    return {
      label,
      href: readHref(slug, b.primary[o.douayChapter - 1] ?? label, o.hash),
      douayChapters: [o.douayChapter],
    };
  });
}

/** Canonical reader page URLs of a book (sitemap): chapters with a page of their own. */
export function readPagePaths(slug: string): string[] {
  if (!isDouaySlug(slug)) return [];
  const b = bookPages(slug);
  return b.labels.filter((l) => b.pages.has(l)).map((l) => readHref(slug, l));
}

export type VerseLabel = {
  /** Douay verse number (storage key). */
  verse: number;
  /** What the reader sees: "19", "7:26", "11–12"; "13" with douay=true when approximate. */
  text: string;
  /** Full reference for memo cards: "34:19" or "Douay 33:13". */
  ref: string;
  /** Approximate / no NABRE counterpart: number shown is the Douay-Rheims one. */
  douay?: true;
  /** Same official verse as the previous Douay verse (merged); render no number. */
  continued?: true;
  /** Anchor id for #v-34-19 links. */
  id?: string;
};

/** Display labels for every verse of one Douay chapter shown on NABRE page `pageLabel`. */
export function verseLabelsForDouayChapter(
  slug: DouaySlug,
  douayChapter: number,
  pageLabel: string,
): VerseLabel[] {
  const out: VerseLabel[] = [];
  let prev = "";
  for (let v = 1; v <= douayVerseCount(slug, douayChapter); v++) {
    const m = douayToNabre(slug, douayChapter, v);
    if (!m || m.quality === "approximate" || m.noCounterpart) {
      out.push({ verse: v, text: String(v), ref: `Douay ${douayChapter}:${v}`, douay: true });
      prev = "";
      continue;
    }
    const ch = String(m.chapter);
    const vt = m.verseEnd && m.verseEnd !== m.verse ? `${m.verse}\u2013${m.verseEnd}` : String(m.verse);
    const text = ch === pageLabel ? vt : `${ch}:${vt}`;
    const label: VerseLabel = { verse: v, text, ref: `${ch}:${vt}`, id: verseAnchorId(ch, m.verse) };
    if (text === prev) {
      label.continued = true;
      delete label.id;
    }
    out.push(label);
    prev = text;
  }
  return out;
}

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  const nums = labels.map(Number);
  const consecutive = nums.every((n, i) => Number.isInteger(n) && (i === 0 || n === nums[i - 1]! + 1));
  if (consecutive) return `${labels[0]}\u2013${labels[labels.length - 1]}`;
  return labels.join(", ");
}

export type ReadPage = {
  type: "page";
  slug: DouaySlug;
  book: NabreBookId;
  /** URL chapter (NABRE), e.g. "34" or "A". */
  label: string;
  /** Official chapters on this page, e.g. "9–10" (Douay Psalm 9). */
  chapterDisplay: string;
  /** Douay-Rheims chapters rendered, in order. */
  douayChapters: number[];
  /** Douay numbers differ from the official ones (show "Douay 33"). */
  douayDiffers: boolean;
  /** For old Douay-numbered links: "Douay Psalm N is official X here". */
  legacy?: { douayChapter: number; href: string; label: string };
};

export type ReadRoute =
  | ReadPage
  | { type: "redirect"; to: string; permanent: boolean }
  | { type: "notFound" };

/**
 * Resolve /bible/read/[bookSlug]/[chapter]. `douay` = the chapter param is a Douay-Rheims
 * chapter (internal links built from stored memos/progress, `?douay=1`).
 */
export function resolveReadRoute(
  bookParam: string,
  chapterParam: string,
  opts: { douay?: boolean; douayVerse?: number } = {},
): ReadRoute {
  const raw = decodeURIComponent(chapterParam).trim();
  if (!isDouaySlug(bookParam)) {
    if (isNabreBookId(bookParam)) {
      const slug = NABRE_BOOK_TO_SLUG[bookParam];
      return { type: "redirect", to: `/bible/read/${slug}/${encodeURIComponent(raw)}`, permanent: true };
    }
    return { type: "notFound" };
  }
  const slug = bookParam;
  const book = SLUG_TO_NABRE_BOOK[slug];

  if (opts.douay) {
    const d = /^\d+$/.test(raw) ? Number(raw) : NaN;
    if (!isValidDouayChapter(slug, d)) return { type: "notFound" };
    return { type: "redirect", to: readHrefForDouay(slug, d, opts.douayVerse), permanent: false };
  }

  const ch = toNabreChapter(book, raw);
  if (ch === null) return { type: "notFound" };
  const label = String(ch);
  if (raw !== chapterUrlPart(label)) {
    return { type: "redirect", to: readHref(slug, label), permanent: true };
  }

  const b = bookPages(slug);
  if (nabreVerseCount(book, ch) === 0) {
    // Not an official chapter. Douay-only numbers (Esther 11-16) are old links: send them on.
    if (typeof ch === "number" && isValidDouayChapter(slug, ch)) {
      return { type: "redirect", to: readHrefForDouay(slug, ch), permanent: true };
    }
    return { type: "notFound" };
  }

  const douayChapters = b.pages.get(label);
  if (!douayChapters) {
    const o = b.orphans.get(label);
    if (!o) return { type: "notFound" };
    return {
      type: "redirect",
      to: readHref(slug, b.primary[o.douayChapter - 1] ?? label, o.hash),
      permanent: false,
    };
  }

  const covered = [label];
  for (const [l, o] of b.orphans) {
    if (douayChapters.includes(o.douayChapter) && b.primary[o.douayChapter - 1] === label) covered.push(l);
  }
  covered.sort((x, y) => b.labels.indexOf(x) - b.labels.indexOf(y));

  const page: ReadPage = {
    type: "page",
    slug,
    book,
    label,
    chapterDisplay: joinLabels(covered),
    douayChapters,
    douayDiffers: joinLabels(douayChapters.map(String)) !== joinLabels(covered),
  };
  if (typeof ch === "number" && isValidDouayChapter(slug, ch) && !douayChapters.includes(ch)) {
    const target = b.primary[ch - 1];
    if (target && target !== label) {
      page.legacy = { douayChapter: ch, href: readHref(slug, target), label: target };
    }
  }
  return page;
}
