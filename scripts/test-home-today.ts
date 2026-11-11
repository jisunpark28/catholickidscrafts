/** Run: npx tsx scripts/test-home-today.ts */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getHomeToday, KID_MISSION_WORD_RE, type HomeToday } from "../src/lib/home/home-today";
import { LITURGY_TOPICS } from "../src/lib/liturgy-topics";
import { getPictureCard } from "../src/lib/resource/cards";
import { upcomingCardDates } from "../src/lib/resource/card-calendar";
import { cardsForMonthDay } from "../src/lib/resource/featured-card";
import { slugToKey } from "../src/lib/resource/sheets";
import { getRomcalCelebration, splitCelebrationNames } from "../src/lib/romcal-liturgical";
import { SAINT_SEO_CARDS, SAINTS_HUB } from "../src/lib/seo/card-seo";
import { evergreenPages } from "../src/lib/seo/evergreen-worksheets";
import { sundayMassWorksheetPath } from "../src/lib/seo/sunday-mass-worksheets";
import type { RomcalCountry } from "../src/lib/sheet-keys";
import { getSundaySheet, listSundaySheetKeys } from "../src/lib/sunday-sheet-content";

const APP = path.join(process.cwd(), "src/app");
const pageExists = (...segs: string[]) =>
  fs.existsSync(path.join(APP, ...segs, "page.tsx")) || fs.existsSync(path.join(APP, ...segs, "page.ts"));

// Route patterns used by getHomeToday, each backed by a real page file in src/app.
assert.ok(pageExists("(site)", "catholic-saints-for-kids", "[slug]"));
assert.ok(pageExists("(site)", "liturgy", "[topic]"));
assert.ok(pageExists("(site)", "catholic-mass-for-kids", "[slug]"));
assert.ok(pageExists("(site)", "sunday-mass-worksheets", "[slug]"));
assert.ok(pageExists("(site)", "resource"));
assert.ok(pageExists("print", "resource", "[slug]"));

// Static params of those routes (same lists their generateStaticParams use).
const STATIC = new Set<string>([
  ...SAINT_SEO_CARDS.map((c) => `${SAINTS_HUB}/${c.slug}`),
  ...LITURGY_TOPICS.map((t) => `/liturgy/${t}`),
  ...evergreenPages("mass").map((p) => `/catholic-mass-for-kids/${p.slug}`),
  ...listSundaySheetKeys().map((k) => sundayMassWorksheetPath(k)),
]);

function assertRoute(url: string, what: string): void {
  assert.ok(url.startsWith("/") && !url.startsWith("//"), `${what}: not a site path: ${url}`);
  const u = new URL(url, "https://www.catholickidscrafts.com");
  if (u.pathname === "/resource") {
    assert.equal(u.searchParams.get("view"), "cards", `${what}: ${url}`);
    assert.ok(getPictureCard(u.searchParams.get("card")), `${what}: unknown card in ${url}`);
    return;
  }
  const print = /^\/print\/resource\/([^/]+)$/.exec(u.pathname);
  if (print) {
    const key = slugToKey(print[1]!);
    assert.ok(key && getSundaySheet(key), `${what}: print slug has no sheet: ${url}`);
    assert.ok(["1", "2"].includes(u.searchParams.get("level") ?? ""), `${what}: print level: ${url}`);
    return;
  }
  assert.equal(u.search, "", `${what}: unexpected query: ${url}`);
  assert.ok(STATIC.has(u.pathname), `${what}: not a static route: ${url}`);
}

function check(t: HomeToday, label: string): void {
  assertRoute(t.season.href, `${label} season`);
  const b = t.banner;
  assertRoute(b.href, `${label} banner`);
  if (b.card) {
    assertRoute(b.card.href, `${label} card href`);
    if (b.card.detailUrl) assertRoute(b.card.detailUrl, `${label} detail`);
    assert.equal(b.href, b.card.href);
    assert.ok(b.card.daysAway >= 0 && b.card.daysAway <= 7, `${label} daysAway`);
    if (b.label === "Read Card →") {
      assert.ok(b.card.relation === "today" && b.card.matchesCelebration, `${label}: generic label for a card that is not today's celebration`);
    } else {
      assert.ok(b.label.includes(b.card.shortTitle) && b.label.endsWith("Card →"), `${label}: label must name ${b.card.id}: ${b.label}`);
      assert.ok(!(b.card.relation === "today" && b.card.matchesCelebration), `${label}: today's celebration should read "Read Card →"`);
    }
    if (b.card.relation === "upcoming") assert.notEqual(b.label, "Read Card →");
  } else {
    assert.equal(b.href, t.season.href, `${label}: fallback must open the season page`);
  }
  assert.ok(t.sunday, `${label}: no Sunday sheet`);
  assertRoute(t.sunday.worksheetUrl, `${label} worksheet`);
  assertRoute(t.sunday.print.level1, `${label} print L1`);
  assertRoute(t.sunday.print.level2, `${label} print L2`);
  assert.match(t.sunday.print.level1, /[?&]level=1(&|$)/);
  assert.match(t.sunday.print.level2, /[?&]level=2(&|$)/);
  assert.ok(t.sunday.date >= t.date && Date.parse(t.sunday.date) - Date.parse(t.date) < 7 * 86_400_000);
  assert.match(t.kidMission.word, KID_MISSION_WORD_RE, `${label}: kid word ${t.kidMission.word}`);
  assert.equal(t.highlights.length, 4, `${label}: highlights`);
  for (const h of t.highlights) {
    assert.ok(h.title.trim(), `${label}: empty highlight title`);
    assertRoute(h.href, `${label} highlight`);
  }
  assert.ok(t.celebration, `${label}: no romcal celebration`);
  assert.ok(t.celebration.names.length >= 1 && t.celebration.names.every((n) => n.trim() && !n.includes("/")));
}

const COUNTRIES: RomcalCountry[] = ["general", "canada", "unitedStates"];
const start = Date.parse("2026-11-10T00:00:00Z");
const end = Date.parse("2027-11-09T00:00:00Z");
let days = 0;
const stats = { readCard: 0, named: 0, seasonFallback: 0, wordFallback: 0 };
for (let t = start; t <= end; t += 86_400_000) {
  const ymd = new Date(t).toISOString().slice(0, 10);
  for (const c of COUNTRIES) {
    let r: HomeToday;
    assert.doesNotThrow(() => {
      r = getHomeToday(ymd, c);
    }, `${ymd} ${c} threw`);
    r = getHomeToday(ymd, c);
    assert.equal(r.date, ymd);
    check(r, `${ymd} ${c}`);
    if (!r.banner.card) stats.seasonFallback++;
    else if (r.banner.label === "Read Card →") stats.readCard++;
    else stats.named++;
    if (r.kidMission.source === "fallback") stats.wordFallback++;
  }
  days++;
}
assert.equal(days, 365);

// Spot checks.
const nicholas = getHomeToday("2026-12-06", "general");
assert.equal(nicholas.banner.card?.id, "SNT-100", "Dec 6 2026 (2nd Sunday of Advent) -> Nicholas");
assert.equal(nicholas.banner.card?.relation, "today");
assert.equal(nicholas.banner.card?.detailUrl, `${SAINTS_HUB}/saint-nicholas`);
for (const c of ["unitedStates", "canada"] as const) {
  const g = getHomeToday("2026-12-12", c);
  assert.equal(g.celebration?.type, "FEAST", `${c} Guadalupe is a feast`);
  assert.ok(g.celebration?.names.some((n) => /Guadalupe/.test(n)));
  assert.equal(g.banner.card?.id, "FEA-035");
  assert.equal(g.banner.label, "Read Card →");
  assert.equal(g.banner.href, `${SAINTS_HUB}/saint-juan-diego`);
}
assert.equal(getHomeToday("2026-12-12", "general").celebration?.type, "OPT_MEMORIAL");
const andreCa = getHomeToday("2027-01-07", "canada");
assert.equal(andreCa.banner.card?.id, "SNT-024");
assert.ok(andreCa.celebration?.names.some((n) => /Andre Bessette/.test(n)));
assert.equal(andreCa.banner.label, "Read Card →");
const andreUs = getHomeToday("2027-01-06", "unitedStates");
assert.equal(andreUs.banner.card?.id, "SNT-024", "US keeps André Bessette on Jan 6");
assert.equal(getHomeToday("2027-04-17", "canada").banner.card?.id, "SNT-021", "Kateri Apr 17 in Canada");
assert.equal(getHomeToday("2027-07-14", "unitedStates").banner.card?.id, "SNT-021", "Kateri Jul 14 in the US");
const leo = getHomeToday("2026-11-10", "general");
assert.ok(leo.celebration?.names.some((n) => /Leo the Great/.test(n)));
assert.equal(leo.banner.card?.id, "SNT-136", "Nov 10 2026 memorial is the new Leo the Great card");
assert.equal(leo.banner.card?.relation, "today");
assert.equal(leo.banner.card?.matchesCelebration, true);
assert.equal(leo.banner.label, "Read Card \u2192");
const ic = getHomeToday("2026-12-08", "general");
assert.equal(ic.banner.card?.id, "FEA-034");
assert.equal(ic.banner.href, sundayMassWorksheetPath("SOL_IMMACULATE"));
assert.equal(getHomeToday("2027-02-10", "general").banner.card?.id, "FEA-008", "Ash Wednesday via romcalKeys");
assert.equal(getHomeToday("2027-05-06", "general").banner.card?.id, "FEA-016", "Ascension Thursday (general)");
assert.equal(getHomeToday("2027-05-09", "canada").banner.card?.id, "FEA-016", "Ascension Sunday (Canada)");
assert.equal(getHomeToday("2027-06-04", "general").banner.card?.id, "FEA-020", "Sacred Heart");
assert.equal(getHomeToday("2027-06-05", "general").banner.card?.id, "MAR-004", "Immaculate Heart");
assert.equal(getHomeToday("2026-11-22", "canada").banner.card?.id, "FEA-033", "Christ the King beats St. Cecilia on the Sunday");
const nov15 = getHomeToday("2026-11-15", "canada");
assert.equal(nov15.sunday?.key, "A_OT33");

// Name splitting and fallbacks.
assert.deepEqual(splitCelebrationNames("Saint Margaret of Scotland/Saint Gertrude the Great, Virgin"), [
  "Saint Margaret of Scotland",
  "Saint Gertrude the Great, Virgin",
]);
assert.deepEqual(splitCelebrationNames("Saint Hedwig, Religious Or Saint Margaret Mary Alacoque, Virgin"), [
  "Saint Hedwig, Religious",
  "Saint Margaret Mary Alacoque, Virgin",
]);
assert.deepEqual(splitCelebrationNames("Saints Fabian, Pope, and Sebastian, Martyrs"), ["Saints Fabian, Pope, and Sebastian, Martyrs"]);
assert.equal(getRomcalCelebration("bad", "general"), null);
assert.doesNotThrow(() => getHomeToday("not-a-date", "general"));
assert.doesNotThrow(() => getHomeToday(new Date("invalid"), "england"));
assert.equal(getHomeToday("2026-11-10", "england").country, "general");

// Country-aware readers.
assert.deepEqual(cardsForMonthDay("04-17", "canada").map((c) => c.id).includes("SNT-021"), true);
assert.deepEqual(cardsForMonthDay("04-17", "unitedStates").map((c) => c.id).includes("SNT-021"), false);
assert.deepEqual(cardsForMonthDay("07-14").map((c) => c.id).includes("SNT-021"), true);
assert.equal(upcomingCardDates("2026-11-10", "2026-11-15", "canada")["SNT-021"]?.date, "2027-04-17");
assert.equal(upcomingCardDates("2026-11-10", "2026-11-15", "unitedStates")["SNT-021"]?.date, "2027-07-14");
assert.equal(upcomingCardDates("2026-11-10", "2026-11-15", "unitedStates")["SNT-024"]?.date, "2027-01-06");
assert.equal(upcomingCardDates("2026-11-10", "2026-11-15", "canada")["SNT-024"]?.date, "2027-01-07");
assert.equal(upcomingCardDates("2026-11-10", "2026-11-15", "general")["FEA-008"]?.date, "2027-02-10");
assert.equal(upcomingCardDates("2026-11-10", "2026-11-15", "canada")["SNT-123"]?.date, "2027-10-20");

if (process.argv.includes("--samples")) {
  for (const [d, c] of [
    ["2026-11-10", "general"],
    ["2026-11-15", "canada"],
    ["2026-12-06", "general"],
    ["2026-12-12", "unitedStates"],
    ["2027-01-07", "canada"],
  ] as const) {
    console.log(JSON.stringify(getHomeToday(d, c), null, 1));
  }
}
console.log(`ok: ${days} days x ${COUNTRIES.length} countries`, stats);
