import { BIBLE_BOOK_CATALOG } from "../src/lib/bible/chapter-notes/catalog";
import { getChapterNote } from "../src/lib/bible/chapter-notes";
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
assert(genesisKo?.summary.includes("계약"), "genesis ko uses Catholic 계약");

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

console.log("test-chapter-notes: ok", BIBLE_BOOK_CATALOG.length, "books");
