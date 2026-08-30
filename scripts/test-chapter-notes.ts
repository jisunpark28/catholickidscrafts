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

console.log("test-chapter-notes: ok", BIBLE_BOOK_CATALOG.length, "books");
