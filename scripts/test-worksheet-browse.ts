/**
 * Worksheets panel browse: weekly-free, season, Mass/Virtue, and search stay on this Sunday's data.
 */
import assert from "node:assert/strict";
import { listActivities } from "../src/lib/resource/activities";
import {
  listWorksheetBrowse,
  parseWorksheetFilter,
  worksheetCalendarMonthDate,
} from "../src/lib/resource/worksheet-browse";
import type { SundayCalendarEntry } from "../src/lib/resource/sunday-season-jumps";

assert.equal(parseWorksheetFilter("free-week"), "free-week");
assert.equal(parseWorksheetFilter("mass"), "mass");
assert.equal(parseWorksheetFilter("virtue"), "virtue");
assert.equal(parseWorksheetFilter("christ-the-king"), "christ-the-king");
assert.equal(parseWorksheetFilter("saint-report"), "saint-report");
assert.equal(parseWorksheetFilter("all"), "all");
assert.equal(parseWorksheetFilter("nope"), "");
assert.equal(parseWorksheetFilter(undefined), "");

// Week of Thu 2026-11-19 ends Sunday 2026-11-22 (Christ the King, Year A).
const free = listWorksheetBrowse({
  filter: "free-week",
  thisSundayKey: "A_OT34",
  weekYmd: "2026-11-19",
});
assert.equal(free.heading, "This week free worksheets");
assert.equal(free.sheets.length, 1);
assert.equal(free.sheets[0]!.key, "A_OT34");
const freeSlugs = free.activities.map((a) => a.slug).sort();
assert.deepEqual(freeSlugs, [
  "come-lord-jesus",
  "happy-new-church-year",
  "helping-hands-like-mary",
  "jesse-tree-picture-a-day",
  "secret-kindness-notes",
  "straw-for-the-manger",
  "white-flower-for-mary",
].sort());
assert.ok(free.activities.every((a) => listActivities().some((x) => x.slug === a.slug)));

const mass = listWorksheetBrowse({ filter: "mass" });
assert.equal(mass.heading, "Mass worksheets");
assert.ok(mass.sheets.length >= 4);
assert.ok(mass.sheets.every((s) => s.key.startsWith("MASS_")));
assert.equal(mass.activities.length, 0);

const virtue = listWorksheetBrowse({ filter: "virtue" });
assert.equal(virtue.heading, "Virtue worksheets");
assert.ok(virtue.sheets.some((s) => s.key === "VIR_GRATITUDE"));
assert.ok(virtue.sheets.every((s) => s.key.startsWith("VIR_")));

const king = listWorksheetBrowse({ filter: "christ-the-king" });
assert.equal(king.heading, "Christ the King worksheets");
assert.ok(king.sheets.length >= 3);
assert.ok(king.sheets.every((s) => s.key.endsWith("_OT34")));

const advent = listWorksheetBrowse({ season: "advent" });
assert.equal(advent.heading, "Advent worksheets");
assert.ok(advent.sheets.length > 0);
assert.ok(advent.sheets.every((s) => /advent/i.test(s.season) || s.key.includes("ADV")));

const search = listWorksheetBrowse({ q: "gratitude" });
assert.match(search.heading, /gratitude/i);
assert.ok(search.sheets.some((s) => s.key === "VIR_GRATITUDE"));

const narrowed = listWorksheetBrowse({ q: "eucharist", filter: "mass" });
assert.ok(narrowed.sheets.some((s) => s.key === "MASS_EUCHARIST"));
assert.ok(narrowed.sheets.every((s) => s.key.startsWith("MASS_")));

const sundays: SundayCalendarEntry[] = [
  { date: "2026-11-22", key: "A_OT34", liturgicalName: "Christ the King", season: "ordinary-time", seasonLabel: "Ordinary Time", color: "white" },
  { date: "2026-11-29", key: "B_ADV01", liturgicalName: "1st Sunday of Advent", season: "advent", seasonLabel: "Advent", color: "purple" },
];
assert.equal(
  worksheetCalendarMonthDate({
    sundays,
    thisSundayDate: "2026-11-22",
    selectedDate: "2026-11-22",
    season: "advent",
  }),
  "2026-11-29",
);
assert.equal(
  worksheetCalendarMonthDate({
    sundays,
    thisSundayDate: "2026-11-22",
    selectedDate: "2026-11-22",
    filter: "free-week",
  }),
  "2026-11-22",
);

const saint = listWorksheetBrowse({ filter: "saint-report" });
assert.equal(saint.heading, "Saint Report Worksheet");
assert.equal(saint.sheets.length, 0);
assert.equal(saint.activities.length, 1);
assert.equal(saint.activities[0]!.slug, "saint-report-worksheet");
assert.equal(saint.activities[0]!.title, "Saint Report Worksheet");

const all = listWorksheetBrowse({ filter: "all" });
assert.equal(all.heading, "All worksheets");
assert.ok(all.sheets.length > 50, `expected many Sunday/evergreen sheets, got ${all.sheets.length}`);
assert.ok(all.activities.length > 10, `expected activities and crafts, got ${all.activities.length}`);
assert.ok(all.activities.some((a) => a.slug === "saint-report-worksheet"));
assert.ok(all.activities.some((a) => a.kind === "Craft"));
assert.equal(all.activities.length, listActivities().length);

console.log(
  `test-worksheet-browse: free-week ${free.activities.length} activities + ${free.sheets.length} sheet; mass ${mass.sheets.length}; virtue ${virtue.sheets.length}; all ${all.sheets.length}+${all.activities.length}`,
);
