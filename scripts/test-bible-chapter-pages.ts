/**
 * Checks the official-numbering reader routes built on ref-map.ts.
 * Run: npx tsx scripts/test-bible-chapter-pages.ts
 */
import {
  chapterGrid,
  officialChapterLabel,
  officialRangeRef,
  readHrefForDouay,
  resolveReadRoute,
  verseLabelsForDouayChapter,
} from "../src/lib/bible/chapter-pages";
import { NABRE_BOOK_TO_SLUG, douayChapterCount } from "../src/lib/bible/ref-map";

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}`, detail ?? "");
  }
}

function page(book: string, ch: string) {
  const r = resolveReadRoute(book, ch);
  return r.type === "page" ? r : null;
}
function redirectTo(book: string, ch: string, opts?: { douay?: boolean; douayVerse?: number }) {
  const r = resolveReadRoute(book, ch, opts);
  return r.type === "redirect" ? r.to : null;
}

// Pages and their Douay chapters
check("Psalm 34 = Douay 33", page("psalms", "34")?.douayChapters.join() === "33");
check("Psalm 23 = Douay 22", page("psalms", "23")?.douayChapters.join() === "22");
check("Psalm 9 = Douay 9 (9-10)", page("psalms", "9")?.chapterDisplay === "9\u201310");
check("Psalm 116 = Douay 114+115", page("psalms", "116")?.douayChapters.join() === "114,115");
check("Psalm 147 = Douay 146+147", page("psalms", "147")?.douayChapters.join() === "146,147");
check("Joel 4 = Douay 3", page("joel", "4")?.douayChapters.join() === "3");
check("Matthew 5 same", page("matthew", "5")?.douayDiffers === false);

// Redirects
check("Psalm 10 -> 9#v-10-1", redirectTo("psalms", "10") === "/bible/read/psalms/9#v-10-1");
check("Psalm 115 -> 114", redirectTo("psalms", "115") === "/bible/read/psalms/114#v-115-1");
check("Joel 3 -> 2", redirectTo("joel", "3") === "/bible/read/joel/2#v-3-1");
check("Douay Psalm 22 link", redirectTo("psalms", "22", { douay: true }) === "/bible/read/psalms/23");
check(
  "Douay memo verse anchor",
  redirectTo("psalms", "33", { douay: true, douayVerse: 19 }) === "/bible/read/psalms/34#v-34-19",
);
check("NABRE book alias", redirectTo("joshua", "1") === "/bible/read/josue/1");
check("Esther 11 legacy -> a", redirectTo("esther", "11") === "/bible/read/esther/a");
check("Leading zero canonical", redirectTo("psalms", "034") === "/bible/read/psalms/34");
check("readHrefForDouay", readHrefForDouay("psalms", 33, 19) === "/bible/read/psalms/34#v-34-19");

// Max-chapter guard
for (const [b, c] of [["malachias", "4"], ["genesis", "51"], ["genesis", "0"], ["psalms", "151"], ["psalms", "x"], ["nope", "1"]]) {
  check(`404 ${b}/${c}`, resolveReadRoute(b!, c!).type === "notFound");
}

// Verse labels
const ps34 = verseLabelsForDouayChapter("psalms", 33, "34");
check("Ps 34:19 label", ps34[18]?.text === "19" && ps34[18]?.id === "v-34-19");
const mt5 = verseLabelsForDouayChapter("matthew", 5, "5");
check("Mt 5:4/5:5 swap", mt5[3]?.text === "5" && mt5[4]?.text === "4", mt5.slice(3, 5));
const ex8 = verseLabelsForDouayChapter("exodus", 8, "8");
check("Exodus 8 starts at 7:26", ex8[0]?.text === "7:26" && ex8[4]?.text === "1");

// Every Douay chapter is on exactly one page and every grid cell resolves to a page
let pages = 0;
for (const slug of Object.values(NABRE_BOOK_TO_SLUG)) {
  const owner = new Map<number, string>();
  for (const cell of chapterGrid(slug)) {
    const path = cell.href.split("#")[0]!.split("/").pop()!;
    const target = resolveReadRoute(slug, path);
    check(`grid ${slug} ${cell.label}`, target.type === "page", cell.href);
    const own = resolveReadRoute(slug, cell.label.toLowerCase());
    check(`label ${slug} ${cell.label}`, own.type !== "notFound");
    if (own.type !== "page") continue;
    pages++;
    for (const d of own.douayChapters) {
      check(`dup ${slug} ${d}`, !owner.has(d) || owner.get(d) === cell.label);
      owner.set(d, cell.label);
    }
  }
  for (let d = 1; d <= douayChapterCount(slug); d++) check(`unreached ${slug} ${d}`, owner.has(d));
}

// Every official psalm 1-150 opens a page (directly or by redirect), e.g. /bible/read/psalms/34
for (let n = 1; n <= 150; n++) {
  let r = resolveReadRoute("psalms", String(n));
  if (r.type === "redirect") r = resolveReadRoute("psalms", r.to.split("#")[0]!.split("/").pop()!);
  check(`psalm ${n} opens`, r.type === "page", r);
}
check("Psalm 34 page", page("psalms", "34")?.chapterDisplay === "34");

// No Douay numbering in anything shown: verse labels and memo references
let labelCount = 0;
for (const slug of Object.values(NABRE_BOOK_TO_SLUG)) {
  for (const cell of chapterGrid(slug)) {
    const own = resolveReadRoute(slug, cell.label.toLowerCase());
    if (own.type !== "page") continue;
    for (const d of own.douayChapters) {
      for (const l of verseLabelsForDouayChapter(slug, d, own.label)) {
        labelCount++;
        if (/douay/i.test(l.ref) || !/^[0-9A-F]+:\d/.test(l.ref)) check(`ref ${slug} ${d}:${l.verse}`, false, l);
      }
    }
  }
}
check("memo ref Ps 34:19", officialRangeRef("psalms", 33, 19, 19) === "34:19");
check("memo ref Ps 23", officialRangeRef("psalms", 22, 1, 6) === "23:1\u20136", officialRangeRef("psalms", 22, 1, 6));
check("memo ref Mt", officialRangeRef("matthew", 5, 3, 3) === "5:3");
check("memo ref unknown book", officialRangeRef("nosuchbook", 1, 1, 1) === null);
check("chapter label Ps 33", officialChapterLabel("psalms", 33) === "34");
console.log(`${labelCount} verse labels checked`);

console.log(`${pages} reader pages checked, ${failures} failures`);
if (failures > 0) process.exit(1);
console.log("bible chapter pages OK");
