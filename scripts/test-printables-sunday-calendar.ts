/**
 * Printables Worksheets calendar: past Sundays selectable + Year A/B/C mapping via romcal.
 */
import assert from "node:assert/strict";
import {
  listSundayCalendar,
  listUpcomingSundays,
  resolveSundayEntry,
} from "../src/lib/resource/sunday-calendar";
import { toSheetKey } from "../src/lib/sheet-keys";

const country = "canada" as const;

// Fixed liturgical anchors (same as test-sheet-keys).
assert.equal(toSheetKey("2026-11-29", country), "B_ADV01");
assert.equal(toSheetKey("2028-03-19", country), "C_LNT03");
assert.equal(toSheetKey("2026-05-17", country), "A_ASCENSION");

const past = resolveSundayEntry("2025-11-02", country); // All Souls on Sunday
assert.ok(past, "past Sunday resolves");
assert.equal(past!.date, "2025-11-02");
assert.equal(past!.key, "SOL_ALLSOULS");

const adventB = resolveSundayEntry("2026-11-29", country);
assert.ok(adventB);
assert.equal(adventB!.key, "B_ADV01");
assert.match(adventB!.liturgicalName, /Advent/i);

const lentC = resolveSundayEntry("2028-03-19", country);
assert.ok(lentC);
assert.equal(lentC!.key, "C_LNT03");

assert.equal(resolveSundayEntry("2026-11-30", country), null, "weekday rejected");
assert.equal(resolveSundayEntry("not-a-date", country), null);

const center = "2026-04-05"; // Palm Sunday 2026 (Year A)
const cal = listSundayCalendar(country, center, 52, 52);
assert.ok(cal.length > 80, `expected ~2y of Sundays, got ${cal.length}`);
assert.ok(cal.some((s) => s.date < center), "calendar includes past Sundays");
assert.ok(cal.some((s) => s.date > center), "calendar includes future Sundays");
assert.ok(cal.some((s) => s.date === "2025-11-02"), "All Souls Sunday in past window");

const upcomingOnly = listUpcomingSundays(country, center, 10);
assert.ok(upcomingOnly.every((s) => s.date >= center), "listUpcomingSundays stays forward-only");

// Same liturgical Sunday in different years → different cycle keys when applicable.
const ot30A = resolveSundayEntry("2026-10-25", country);
const ot30B = resolveSundayEntry("2027-10-24", country);
assert.ok(ot30A && ot30B);
assert.match(ot30A!.key, /^A_/);
assert.match(ot30B!.key, /^B_/);
assert.notEqual(ot30A!.key, ot30B!.key);

console.log(
  `test-printables-sunday-calendar: ${cal.length} Sundays around ${center}; past+ABC mapping ok`,
);
