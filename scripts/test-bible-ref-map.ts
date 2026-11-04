/**
 * Verifies src/lib/bible/ref-map.ts against the verse-by-verse alignment of every chapter
 * (NABRE bible.usccb.org vs Douay-Rheims latinprayer.org) captured on 2026-11-04 in
 * scripts/fixtures/bible-ref-map-alignment.json.
 *
 * Run: npx tsx scripts/test-bible-ref-map.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  clampDouayChapter,
  douayChapterCount,
  douayToNabre,
  isValidDouayChapter,
  nabreToDouay,
  type DouaySlug,
  type NabreBookId,
  type NabreChapter,
} from "../src/lib/bible/ref-map";

type Entry = [number, number, number, number, number, number, 0 | 1 | 2 | 3];
type Fixture = Record<
  string,
  { douay: string; nabreCounts: number[]; douayCounts: number[]; n2d: Entry[]; d2n: Entry[] }
>;

const QUALITY = ["exact", "partial", "approximate", "approximate"] as const;
const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "fixtures", "bible-ref-map-alignment.json"), "utf8"),
) as Fixture;

let failures = 0;
let checked = 0;
function fail(msg: string) {
  failures++;
  if (failures <= 30) console.error("FAIL", msg);
}
function assert(cond: boolean, msg: string) {
  if (!cond) fail(msg);
}

const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;
const label = (book: string, c: number): NabreChapter =>
  book === "esther" && c >= 41 ? LETTERS[c - 41] : c;

type Got = { chapter: NabreChapter | number; verse: number; verseEnd?: number; quality: string; noCounterpart?: true } | null;

function expectOne(
  tag: string,
  got: Got,
  entry: Entry | undefined,
  c: number,
  v: number,
  targetCounts: number[],
  targetLabel: (c: number) => NabreChapter | number,
) {
  checked++;
  if (!entry) {
    const ok = v <= (targetCounts[c - 1] ?? 0);
    if (!ok) return fail(`${tag}: same-number default but target lacks ${c}:${v}`);
    if (!got || got.chapter !== targetLabel(c) || got.verse !== v || got.quality !== "exact" || got.verseEnd)
      fail(`${tag}: expected identity, got ${JSON.stringify(got)}`);
    return;
  }
  const [, , , tc, tv, te, q] = entry;
  if (q === 3 && tc === 0) return assert(got === null, `${tag}: expected null`);
  const want = { chapter: targetLabel(tc), verse: tv, verseEnd: te || undefined, quality: QUALITY[q] };
  if (
    !got ||
    got.chapter !== want.chapter ||
    got.verse !== want.verse ||
    got.verseEnd !== want.verseEnd ||
    got.quality !== want.quality ||
    (q === 3) !== (got.noCounterpart === true)
  )
    fail(`${tag}: want ${JSON.stringify(want)} got ${JSON.stringify(got)}`);
}

let chapters = 0;
for (const [book, f] of Object.entries(fixture)) {
  const nb = book as NabreBookId;
  const slug = f.douay as DouaySlug;
  const n2d = new Map(f.n2d.map((e) => [`${e[0]}:${e[1]}`, e]));
  const d2n = new Map(f.d2n.map((e) => [`${e[0]}:${e[1]}`, e]));
  f.nabreCounts.forEach((n, i) => {
    const c = i + 1;
    if (n) chapters++;
    for (let v = 1; v <= n; v++) {
      expectOne(`N ${book} ${c}:${v}`, nabreToDouay(nb, label(book, c), v), n2d.get(`${c}:${v}`), c, v, f.douayCounts, (x) => x);
    }
    if (n) assert(nabreToDouay(nb, label(book, c), n + 1) === null, `N ${book} ${c}:${n + 1} out of range`);
  });
  f.douayCounts.forEach((n, i) => {
    const c = i + 1;
    for (let v = 1; v <= n; v++) {
      expectOne(`D ${slug} ${c}:${v}`, douayToNabre(slug, c, v), d2n.get(`${c}:${v}`), c, v, f.nabreCounts, (x) => label(book, x));
    }
  });
  assert(douayChapterCount(slug) === f.douayCounts.length, `${slug} chapter count`);
  assert(!isValidDouayChapter(slug, f.douayCounts.length + 1), `${slug} max chapter guard`);
}

// Spot checks from the Mom's Bible situation list and known Vulgate differences.
const spot = (got: Got, chapter: number | string, verse: number, msg: string) => {
  checked++;
  assert(!!got && got.chapter === chapter && got.verse === verse, `${msg}: got ${JSON.stringify(got)}`);
};
spot(nabreToDouay("psalms", 34, 19), 33, 19, "Ps 34:19 -> Douay Ps 33:19");
spot(nabreToDouay("psalms", 23, 1), 22, 1, "Ps 23:1 -> Douay Ps 22:1");
spot(nabreToDouay("psalms", 4, 9), 4, 9, "Ps 4:9 -> Douay Ps 4:9");
spot(nabreToDouay("psalms", 147, 3), 146, 3, "Ps 147:3 -> Douay Ps 146:3");
spot(nabreToDouay("matthew", 5, 4), 5, 5, "Mt 5:4 (mourn) -> Douay Mt 5:5");
spot(nabreToDouay("matthew", 5, 5), 5, 4, "Mt 5:5 (meek) -> Douay Mt 5:4");
spot(nabreToDouay("joel", 3, 1), 2, 28, "Joel 3:1 -> Douay Joel 2:28");
spot(nabreToDouay("1kings", 5, 1), 4, 21, "1 Kgs 5:1 -> 3 Kings 4:21");
spot(nabreToDouay("esther", "A", 1), 11, 2, "Esther A:1 -> Douay Esther 11:2");
spot(douayToNabre("psalms", 22, 1), 23, 1, "Douay Ps 22:1 -> Ps 23:1");
assert(douayToNabre("romans", 16, 24)?.noCounterpart === true, "Rom 16:24 has no NABRE counterpart");
assert(!isValidDouayChapter("malachias", 4), "malachias has no chapter 4 on the site");
assert(clampDouayChapter("malachias", 4) === 3, "clamp malachias 4 -> 3");
assert(nabreToDouay("genesis", 51, 1) === null, "Gen 51 does not exist");

console.log(`${Object.keys(fixture).length} books, ${chapters} NABRE chapters, ${checked} verse checks, ${failures} failures`);
if (failures) process.exit(1);
console.log("bible ref-map OK");
