import assert from "node:assert/strict";
import {
  ALL_SHEET_KEYS,
  ENABLED_COUNTRIES,
  SUNDAY_KEYS,
  isValidSheetKey,
  nextSundayKey,
  regularSundayKey,
  resolveCountry,
  sheetKeyDetail,
  toSheetKey,
} from "../src/lib/sheet-keys";

const DAY = 86_400_000;

assert.equal(ALL_SHEET_KEYS.length, 188, "expected 188 sheet keys");
assert.equal(new Set(ALL_SHEET_KEYS).size, 188, "sheet keys must be unique");

function* sundays(from: string, to: string): Generator<string> {
  let t = Date.parse(`${from}T00:00:00Z`);
  t += ((7 - new Date(t).getUTCDay()) % 7) * DAY;
  const end = Date.parse(`${to}T00:00:00Z`);
  for (; t <= end; t += 7 * DAY) yield new Date(t).toISOString().slice(0, 10);
}

// Keys that recur every cycle regardless of where OT weeks fall. EAS07 is
// excluded: with Ascension moved to Sunday (all enabled countries) the 7th
// Sunday of Easter never occurs.
const ALWAYS_REACHED = SUNDAY_KEYS.filter(
  (k) => !/^OT/.test(k) && !["CHRISTMAS", "HOLYFAMILY", "MARYMOTHER", "BAPTISM", "EAS07"].includes(k),
);

for (const country of ENABLED_COUNTRIES) {
  const seen = new Set<string>();
  const fallbacks: string[] = [];
  let count = 0;
  for (const day of sundays("2025-01-01", "2035-12-31")) {
    const d = sheetKeyDetail(day, country);
    count++;
    assert.ok(isValidSheetKey(d.key), `${country} ${day}: invalid key ${d.key} (romcal ${d.romcalKey})`);
    seen.add(d.key);
    if (d.source === "fallback") fallbacks.push(`${day} ${d.romcalKey} -> ${d.key}`);
    // Date arithmetic must agree with romcal for ordinary season Sundays.
    if (d.source === "sunday") {
      assert.equal(d.key.slice(2), regularSundayKey(day), `${country} ${day}: romcal ${d.romcalKey} vs arithmetic`);
    }
  }
  assert.equal(count, 574, `${country}: expected 574 Sundays`);
  for (const cycle of ["A", "B", "C"]) {
    for (const k of ALWAYS_REACHED) {
      assert.ok(seen.has(`${cycle}_${k}`), `${country}: ${cycle}_${k} never reached 2025-2035`);
    }
  }
  console.log(`${country}: ${count} Sundays ok, ${seen.size} distinct keys, fallbacks: ${fallbacks.join("; ") || "none"}`);
}

const fixed: Array<[string, string, string]> = [
  ["canada", "2025-11-02", "SOL_ALLSOULS"],
  ["unitedStates", "2025-11-02", "SOL_ALLSOULS"],
  ["canada", "2026-11-01", "SOL_ALLSAINTS"],
  ["unitedStates", "2026-11-01", "SOL_ALLSAINTS"],
  // romcal: Advent 2026 opens Year B (not A).
  ["canada", "2026-11-29", "B_ADV01"],
  ["canada", "2026-05-17", "A_ASCENSION"],
  ["unitedStates", "2026-05-17", "A_ASCENSION"],
  ["canada", "2028-03-19", "C_LNT03"],
  ["unitedStates", "2028-03-19", "C_LNT03"],
  ["canada", "2030-12-08", "C_ADV02"],
  ["unitedStates", "2030-12-08", "C_ADV02"],
  ["canada", "2026-01-04", "A_EPIPHANY"],
];
for (const [country, day, want] of fixed) {
  assert.equal(toSheetKey(day, country as (typeof ENABLED_COUNTRIES)[number]), want, `${country} ${day}`);
}

assert.equal(nextSundayKey("2026-11-26", "canada"), "B_ADV01");
assert.equal(nextSundayKey("2026-11-29", "canada"), "B_ADV01");

assert.equal(resolveCountry("CA"), "canada");
assert.equal(resolveCountry("US", null), "unitedStates");
assert.equal(resolveCountry("GB"), "general");
assert.equal(resolveCountry("CA", "unitedStates"), "unitedStates");
assert.equal(resolveCountry("US", "ca"), "canada");
assert.equal(resolveCountry(undefined, "ireland"), "general");
assert.equal(resolveCountry("ZZ", "bogus"), "general");
assert.equal(resolveCountry(null), "general");

console.log("test-sheet-keys: ok");
