import assert from "node:assert/strict";
import { getLiturgicalSeason } from "../src/lib/liturgical-season";
import { currentSeasonHref } from "../src/lib/liturgy-season-href";

const DAY = 86_400_000;

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Gregorian Easter Sunday (Meeus/Jones/Butcher) — same formula as the lib. */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Baptism of the Lord, General Roman Calendar: Sunday after 6 January.
 * Independent of the production helper so a bad formula cannot hide here.
 */
function baptismGeneral(year: number): Date {
  const epiphany = utc(year, 1, 6);
  const dow = epiphany.getUTCDay();
  return addDays(epiphany, dow === 0 ? 7 : 7 - dow);
}

function between(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function adventStart(year: number): Date {
  const christmas = utc(year, 12, 25);
  const dow = christmas.getUTCDay();
  const daysBefore = (dow + 21) % 7;
  return addDays(christmas, -daysBefore - 21);
}

/** Snapshot of getLiturgicalSeason before this fix, for a full-year diff. */
function getLiturgicalSeasonOld(date: Date): string {
  const year = date.getUTCFullYear();
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const pentecost = addDays(easter, 49);
  const advent = adventStart(year);
  const christmas = utc(year, 12, 25);
  const baptism = utc(year, 1, 6);

  if (between(date, holyThursday, addDays(easter, -1))) return "Holy Week";
  if (date.getTime() === easter.getTime()) return "Easter";
  if (between(date, addDays(easter, 1), pentecost)) return "Easter Season";
  if (between(date, ashWednesday, addDays(palmSunday, -1))) return "Lent";
  if (between(date, advent, addDays(christmas, -1))) return "Advent";
  if (between(date, christmas, baptism)) return "Christmas Season";
  return "Ordinary Time";
}

function eachDay(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += DAY) days.push(new Date(t));
  return days;
}

function nameOf(date: Date): string {
  return getLiturgicalSeason(date).name;
}

function hrefOf(date: Date): string {
  return currentSeasonHref(date);
}

// Independently computed Baptism dates (General Roman Calendar).
assert.equal(ymd(baptismGeneral(2026)), "2026-01-11");
assert.equal(ymd(baptismGeneral(2027)), "2027-01-10");
assert.equal(ymd(baptismGeneral(2028)), "2028-01-09");
assert.equal(ymd(baptismGeneral(2023)), "2023-01-08"); // Jan 6 was Friday
assert.equal(ymd(baptismGeneral(2024)), "2024-01-07"); // Jan 6 was Saturday
assert.equal(ymd(baptismGeneral(2030)), "2030-01-13"); // Jan 6 is Sunday

function assertRange(
  from: Date,
  to: Date,
  expected: string,
  href: string,
  color?: "purple" | "white" | "green",
) {
  for (const date of eachDay(from, to)) {
    const info = getLiturgicalSeason(date);
    const label = ymd(date);
    assert.equal(info.name, expected, `${label} should be ${expected}`);
    assert.equal(hrefOf(date), href, `${label} href`);
    if (color) assert.equal(info.color, color, `${label} color`);
  }
}

// 2027 Holy Week edges
assertRange(utc(2027, 3, 21), utc(2027, 3, 24), "Lent", "/liturgy/lent", "purple");
assertRange(utc(2027, 3, 25), utc(2027, 3, 27), "Holy Week", "/liturgy/paschal-triduum", "purple");
assert.equal(nameOf(utc(2027, 3, 20)), "Lent", "Saturday before Palm Sunday stays Lent");
assert.equal(nameOf(utc(2027, 3, 28)), "Easter");
assert.equal(hrefOf(utc(2027, 3, 28)), "/liturgy/easter-time");

// 2027 Christmas through Baptism (10 Jan) and Ordinary Time the next day
assertRange(utc(2027, 1, 7), utc(2027, 1, 10), "Christmas Season", "/liturgy/christmas-time", "white");
assert.equal(nameOf(utc(2027, 1, 11)), "Ordinary Time");
assert.equal(hrefOf(utc(2027, 1, 11)), "/liturgy/ordinary-time");
assert.equal(getLiturgicalSeason(utc(2027, 1, 11)).color, "green");

// 2026 and 2028: same edges
assertRange(utc(2026, 3, 29), utc(2026, 4, 1), "Lent", "/liturgy/lent", "purple");
assertRange(utc(2026, 4, 2), utc(2026, 4, 4), "Holy Week", "/liturgy/paschal-triduum", "purple");
assertRange(utc(2026, 1, 7), utc(2026, 1, 11), "Christmas Season", "/liturgy/christmas-time", "white");
assert.equal(nameOf(utc(2026, 1, 12)), "Ordinary Time");

assertRange(utc(2028, 4, 9), utc(2028, 4, 12), "Lent", "/liturgy/lent", "purple");
assertRange(utc(2028, 4, 13), utc(2028, 4, 15), "Holy Week", "/liturgy/paschal-triduum", "purple");
assertRange(utc(2028, 1, 7), utc(2028, 1, 9), "Christmas Season", "/liturgy/christmas-time", "white");
assert.equal(nameOf(utc(2028, 1, 10)), "Ordinary Time");

// Year-boundary Christmas days the old function never labelled (empty range).
assertRange(utc(2026, 12, 25), utc(2027, 1, 6), "Christmas Season", "/liturgy/christmas-time", "white");
assert.equal(nameOf(utc(2026, 12, 24)), "Advent");
assert.equal(hrefOf(utc(2026, 12, 24)), "/liturgy/advent");

// General calendar (not US/Canada): 2024 Baptism is Sunday 7 Jan, not Monday 8 Jan.
assert.equal(nameOf(utc(2024, 1, 7)), "Christmas Season");
assert.equal(nameOf(utc(2024, 1, 8)), "Ordinary Time");
assert.equal(nameOf(utc(2030, 1, 13)), "Christmas Season");
assert.equal(nameOf(utc(2030, 1, 14)), "Ordinary Time");

type Change = { date: string; from: string; to: string };
const changes: Change[] = [];

function expectedChange(date: Date): { from: string; to: string } | null {
  const year = date.getUTCFullYear();
  const easter = easterSunday(year);
  const palmSunday = addDays(easter, -7);
  const holyWednesday = addDays(easter, -4);
  const baptism = baptismGeneral(year);
  const christmasPrev = utc(year - 1, 12, 25);
  const christmas = utc(year, 12, 25);
  const baptismNext = baptismGeneral(year + 1);

  if (between(date, palmSunday, holyWednesday)) {
    return { from: "Ordinary Time", to: "Lent" };
  }
  if (between(date, christmasPrev, baptism) || between(date, christmas, baptismNext)) {
    return { from: "Ordinary Time", to: "Christmas Season" };
  }
  return null;
}

for (const year of [2023, 2024, 2026, 2027, 2028, 2030]) {
  for (const date of eachDay(utc(year, 1, 1), utc(year, 12, 31))) {
    const oldName = getLiturgicalSeasonOld(date);
    const newName = nameOf(date);
    if (oldName === newName) {
      assert.equal(expectedChange(date), null, `${ymd(date)} unexpectedly expected to change`);
      continue;
    }
    const want = expectedChange(date);
    assert.ok(want, `${ymd(date)} changed ${oldName} -> ${newName} but is not an intended edge`);
    assert.equal(oldName, want.from, `${ymd(date)} old label`);
    assert.equal(newName, want.to, `${ymd(date)} new label`);
    changes.push({ date: ymd(date), from: oldName, to: newName });
  }
}

const byYear = new Map<number, Change[]>();
for (const change of changes) {
  const year = Number(change.date.slice(0, 4));
  const list = byYear.get(year) ?? [];
  list.push(change);
  byYear.set(year, list);
}

console.log("Changed dates (old -> new):");
for (const [year, list] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
  const lent = list.filter((c) => c.to === "Lent").map((c) => c.date);
  const christmas = list.filter((c) => c.to === "Christmas Season").map((c) => c.date);
  const jan = christmas.filter((d) => d.slice(5, 7) === "01");
  const dec = christmas.filter((d) => d.slice(5, 7) === "12");
  console.log(`  ${year}:`);
  console.log(`    Lent (${lent.length}): ${lent[0]}..${lent[lent.length - 1]}`);
  console.log(`    Christmas Season (${christmas.length}): ${jan[0]}..${jan[jan.length - 1]}, ${dec[0]}..${dec[dec.length - 1]}`);
}

console.log(`test-liturgical-season: ok (${changes.length} edge days across ${byYear.size} years)`);
