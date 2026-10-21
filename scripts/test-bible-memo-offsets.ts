import {
  buildVerseOffsetTable,
  chapterTextVersion,
  offsetsToVerseRange,
  verseAtOffset,
  verseRangeToOffsets,
} from "../src/lib/bible-memos/verse-offsets";
import { normalizePassageText } from "../src/lib/typing-accuracy";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const verses = [
  { verse: 1, text: "  And seeing the multitudes,\u00A0he went up into a mountain;" },
  { verse: 2, text: "And opening his mouth\u2014he taught them,   saying:" },
  { verse: 3, text: "\u201CBlessed are the poor in spirit\u2026\u201D " },
  { verse: 4, text: "Blessed are the meek: for they shall possess the land." },
];
const full = normalizePassageText(verses.map((v) => v.text).join(" "));
const table = buildVerseOffsetTable(verses);
assert(table !== null, "table builds");
assert(table!.length === full.length, `length ${table!.length} vs ${full.length}`);
for (const v of verses) {
  const start = table!.verses.find((x) => x.verse === v.verse)!.start;
  const piece = normalizePassageText(v.text);
  assert(full.slice(start, start + piece.length) === piece, `verse ${v.verse} anchored`);
  assert(verseAtOffset(table!, start) === v.verse, `verseAtOffset start ${v.verse}`);
  assert(verseAtOffset(table!, start + piece.length - 1) === v.verse, `verseAtOffset end ${v.verse}`);
}

const s3 = full.indexOf('"Blessed');
const e3 = full.indexOf('..."') + 4;
assert(JSON.stringify(offsetsToVerseRange(table!, s3, e3)) === JSON.stringify({ startVerse: 3, endVerse: 3 }), "single verse");
const s2 = full.indexOf("opening");
const e4 = full.indexOf("meek") + 4;
assert(JSON.stringify(offsetsToVerseRange(table!, s2, e4)) === JSON.stringify({ startVerse: 2, endVerse: 4 }), "multi verse");
// Reversed selection.
assert(offsetsToVerseRange(table!, e4, s2).startVerse === 2, "reversed");

const r = verseRangeToOffsets(table!, 2, 3)!;
assert(full.slice(r.start, r.end) === `${normalizePassageText(verses[1]!.text)} ${normalizePassageText(verses[2]!.text)}`, "verse range offsets");
const last = verseRangeToOffsets(table!, 4, 4)!;
assert(last.end === full.length, "last verse ends at text end");
assert(verseRangeToOffsets(table!, 9, 9) === null, "unknown verse");

assert(chapterTextVersion(full) === chapterTextVersion(full), "stable version");
assert(chapterTextVersion(full) !== chapterTextVersion(full + "x"), "version changes");
assert(buildVerseOffsetTable([]) === null, "empty");

console.log("test-bible-memo-offsets: ok");
