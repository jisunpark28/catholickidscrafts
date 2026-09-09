import { BIBLE_BOOK_CATALOG, getBibleBookCatalogEntry } from "../src/lib/bible/chapter-notes/catalog";
import { getChapterNote } from "../src/lib/bible/chapter-notes";
import {
  CHAPTER_RANGE_BOOK_SLUGS,
  getChapterRangeBlurb,
} from "../src/lib/bible/chapter-notes/chapter-range-blurbs";
import { PRAYER_LANGUAGE_CODES } from "../src/lib/prayers/prayer-languages";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

for (const book of BIBLE_BOOK_CATALOG) {
  for (const locale of PRAYER_LANGUAGE_CODES) {
    const note = getChapterNote(book.slug, 1, locale, book.slug);
    assert(note !== null, `${book.slug} ch1 ${locale} should have note`);
    assert(note.summary.length > 10, `${book.slug} ch1 ${locale} summary too short`);
  }
}

const markKo = getChapterNote("mark", 2, "ko", "Mark");
assert(markKo?.summary.includes("마비") || markKo?.summary.includes("레위"), "mark ch2 ko manual note");

const genesisEs = getChapterNote("genesis", 1, "es", "Genesis");
assert(genesisEs?.summary.includes("Génesis") || genesisEs?.summary.includes("Abraham"), "genesis es");

const PROTESTANT_KO_TERMS = [
  "하나님",
  "준경전",
  "대제사장",
  "세례 요한",
  "언약",
  "열바구",
  "성체 예배",
  "말세",
  "백부장",
  "마가",
  "갈릴리",
];

function koreanNoteText(note: { summary: string; words?: { term: string; gloss: string }[] }): string {
  const glosses = (note.words ?? []).map((word) => `${word.term} ${word.gloss}`).join(" ");
  return `${note.summary} ${glosses}`;
}

for (const book of BIBLE_BOOK_CATALOG) {
  const note = getChapterNote(book.slug, 1, "ko", book.slug);
  assert(note !== null, `${book.slug} ch1 ko note`);
  const text = koreanNoteText(note!);
  for (const term of PROTESTANT_KO_TERMS) {
    assert(!text.includes(term), `${book.slug} ch1 ko still has Protestant term: ${term}`);
  }
}

for (let chapter = 1; chapter <= 16; chapter += 1) {
  const note = getChapterNote("mark", chapter, "ko", "Mark");
  assert(note !== null, `mark ch${chapter} ko note`);
  const text = koreanNoteText(note!);
  for (const term of PROTESTANT_KO_TERMS) {
    assert(!text.includes(term), `mark ch${chapter} ko still has Protestant term: ${term}`);
  }
}

const genesisKo = getChapterNote("genesis", 1, "ko", "Genesis");
assert(genesisKo?.summary.includes("하느님"), "genesis ko uses 하느님");
assert(genesisKo?.summary.includes("창조") || genesisKo?.summary.includes("천지"), "genesis 1 ko is creation");
assert(!genesisKo?.summary.includes("아브라함"), "genesis 1 ko must not jump to Abraham");
assert(genesisKo?.words?.some((word) => word.term === "계약") === true, "genesis glossary uses Catholic 계약");

const genesis12Ko = getChapterNote("genesis", 12, "ko", "Genesis");
assert(genesis12Ko?.summary.includes("아브라함") === true, "genesis 12 ko mentions Abraham");
assert(genesis12Ko?.summary.includes("계약") === true, "genesis 12 ko uses Catholic 계약");

const genesis37Ko = getChapterNote("genesis", 37, "ko", "Genesis");
assert(genesis37Ko?.summary.includes("요셉") === true, "genesis 37 ko mentions Joseph");

const exodus1Ko = getChapterNote("exodus", 1, "ko", "Exodus");
assert(exodus1Ko?.summary.includes("이집트") === true, "exodus 1 ko is Egypt, not Sinai");
assert(!exodus1Ko?.summary.includes("십계명"), "exodus 1 ko must not jump to the Ten Commandments");

const exodus20Ko = getChapterNote("exodus", 20, "ko", "Exodus");
assert(exodus20Ko?.summary.includes("십계명") === true, "exodus 20 ko mentions the Ten Commandments");

const mark3Ko = getChapterNote("mark", 3, "ko", "Mark");
assert(!mark3Ko?.summary.includes("성령 탓으로"), "mark 3 ko should not reverse the Holy Spirit warning");
assert(mark3Ko?.summary.includes("악마") === true || mark3Ko?.summary.includes("마귀") === true, "mark 3 ko attributes Jesus' works to the devil");

const matthew1Ko = getChapterNote("matthew", 1, "ko", "Matthew");
assert(matthew1Ko?.summary.includes("탄생") === true, "matthew 1 ko is the birth");
assert(!matthew1Ko?.summary.includes("수난"), "matthew 1 ko must not jump to the Passion");

const acts1Ko = getChapterNote("acts", 1, "ko", "Acts");
assert(acts1Ko?.summary.includes("승천") === true, "acts 1 ko is the Ascension");
assert(!acts1Ko?.summary.includes("성령 강림"), "acts 1 ko must not jump to Pentecost");

const hebrewsKo = getChapterNote("hebrews", 1, "ko", "Hebrews");
assert(hebrewsKo?.summary.includes("대사제"), "hebrews ko uses 대사제");

const mark1Ko = getChapterNote("mark", 1, "ko", "Mark");
assert(mark1Ko?.summary.includes("세례자 요한"), "mark ch1 uses 세례자 요한");
assert(mark1Ko?.summary.includes("갈릴래아"), "mark ch1 uses Catholic 갈릴래아");

const malachiCh4 = getChapterNote("malachias", 4, "en", "Malachi");
assert(malachiCh4 === null, "Malachi has 3 chapters (CBCK/NAB/Douay)");

const romansEn = getChapterNote("romans", 1, "en", "Romans");
assert(romansEn?.summary.includes("made righteous"), "romans en avoids sola-fide phrasing");
assert(!romansEn?.summary.includes("justification by faith"), "romans en not Protestant justification by faith");

const cor1En = getChapterNote("1-corinthians", 1, "en", "1 Corinthians");
assert(cor1En?.summary.includes("Eucharist"), "1 corinthians en uses Eucharist");
assert(!cor1En?.summary.includes("Eucharistic worship"), "1 corinthians en not Eucharistic worship");

const mark13En = getChapterNote("mark", 13, "en", "Mark");
assert(mark13En?.words?.some((w) => w.term === "last days"), "mark 13 en uses last days");
assert(!mark13En?.words?.some((w) => w.term === "end times"), "mark 13 en not end times");

const josueEn = getChapterNote("josue", 1, "en", "Josue");
assert(josueEn?.summary.includes("Joshua"), "josue notes display NAB Joshua");
assert(!josueEn?.summary.startsWith("Josue"), "josue notes do not keep Douay Josue");

const genesisEn = getChapterNote("genesis", 1, "en", "Genesis");
assert(genesisEn?.summary.includes("creates") === true, "genesis 1 en is creation");
assert(!genesisEn?.summary.includes("Abraham"), "genesis 1 en must not jump to Abraham");

const leviticusEn = getChapterNote("leviticus", 1, "en", "Leviticus");
assert(leviticusEn?.summary.includes("This book:") === true, "leviticus 1 en marks book-level plot as the whole book");

assert(!genesisEs?.summary.includes("forms the first human family"), "spanish genesis 1 must not use English range blurbs");

for (const slug of CHAPTER_RANGE_BOOK_SLUGS) {
  const entry = getBibleBookCatalogEntry(slug);
  assert(entry !== undefined, `${slug} range book missing from catalog`);
  for (let chapter = 1; chapter <= entry!.totalChapters; chapter += 1) {
    assert(Boolean(getChapterRangeBlurb(slug, chapter, "en")), `${slug} ch${chapter} missing English range`);
    assert(Boolean(getChapterRangeBlurb(slug, chapter, "ko")), `${slug} ch${chapter} missing Korean range`);
    assert(getChapterRangeBlurb(slug, chapter, "es") === undefined, `${slug} ch${chapter} must not leak English ranges into Spanish`);
    const rangeKo = getChapterNote(slug, chapter, "ko", slug);
    assert(rangeKo !== null, `${slug} ch${chapter} ko note`);
    const rangeText = koreanNoteText(rangeKo!);
    for (const term of PROTESTANT_KO_TERMS) {
      assert(!rangeText.includes(term), `${slug} ch${chapter} ko still has Protestant term: ${term}`);
    }
  }
}

console.log("test-chapter-notes: ok", BIBLE_BOOK_CATALOG.length, "books");
