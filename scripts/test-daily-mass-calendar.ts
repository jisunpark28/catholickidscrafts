import assert from "node:assert/strict";
import fs from "node:fs";
import { deviceDateKey } from "../src/lib/daily-mass/device-date";
import {
  daysInUtcMonth,
  monthGrid,
  shiftCalendarMonth,
  utcWeekday,
} from "../src/lib/daily-mass/month-grid";
import { readingRefs } from "../src/lib/daily-mass/reading-refs";
import { universalisJsonpUrlClient } from "../src/lib/universalis-client";

function cells(year: number, month: number) {
  return monthGrid(year, month).filter((cell): cell is NonNullable<typeof cell> => cell !== null);
}

assert.equal(new Date(Date.UTC(2026, 10, 6)).getUTCDay(), 5, "6 Nov 2026 is Friday");
assert.equal(utcWeekday(2026, 11, 1), 0, "1 Nov 2026 is Sunday");
assert.equal(utcWeekday(2026, 11, 6), 5);

const november = monthGrid(2026, 11);
assert.equal(november.length % 7, 0);
assert.equal(november[0]?.date, "2026-11-01");
assert.equal(november[5]?.day, 6);
assert.equal(november.filter((cell) => cell === null).length, 5, "November 2026 ends on Monday, five trailing blanks");
assert.equal(cells(2026, 11).at(-1)?.date, "2026-11-30");

assert.equal(daysInUtcMonth(2024, 2), 29);
assert.equal(daysInUtcMonth(2000, 2), 29);
assert.equal(daysInUtcMonth(2025, 2), 28);
assert.equal(daysInUtcMonth(2100, 2), 28);
assert.equal(cells(2024, 2).at(-1)?.date, "2024-02-29");
assert.equal(cells(2025, 2).at(-1)?.date, "2025-02-28");
assert.equal(utcWeekday(2024, 2, 29), new Date(Date.UTC(2024, 1, 29)).getUTCDay());

assert.deepEqual(shiftCalendarMonth(2026, 12, 1), { year: 2027, month: 1 });
assert.deepEqual(shiftCalendarMonth(2026, 1, -1), { year: 2025, month: 12 });
assert.deepEqual(shiftCalendarMonth(1970, 1, -1), null);
assert.deepEqual(shiftCalendarMonth(2100, 12, 1), null);
assert.deepEqual(shiftCalendarMonth(1970, 1, 0), { year: 1970, month: 1 });
assert.deepEqual(shiftCalendarMonth(2100, 12, 0), { year: 2100, month: 12 });

const now = new Date("2026-11-06T23:30:00Z");
const local = deviceDateKey(now);
assert.match(local, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(
  local,
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
);

const refs = readingRefs([
  { kind: "gospel", label: "Gospel", title: "Holy Gospel according to Saint Luke 16,1-8." },
  { kind: "psalm", label: "Responsorial Psalm", title: "Psalm 122:1-2" },
  { kind: "first_reading", label: "First Reading", title: "Philippians 3:17-4:1" },
  { kind: "gospel", label: "Gospel", title: "Luke 16:9-15" },
  { kind: "second_reading", label: "Second Reading", title: "Romans 8:1-4" },
  { kind: "alleluia", label: "Alleluia", title: "  " },
  { kind: "sequence", label: "Sequence", title: "Victimae paschali laudes" },
]);
assert.deepEqual(
  refs.map((reading) => `${reading.kind}:${reading.citation}`),
  [
    "first_reading:Philippians 3:17-4:1",
    "psalm:Psalm 122:1-2",
    "second_reading:Romans 8:1-4",
    "gospel:Luke 16:1-8",
    "gospel:Luke 16:9-15",
    "sequence:Victimae paschali laudes",
  ],
);

const page = fs.readFileSync("src/app/(site)/daily-mass/page.tsx", "utf8");
const view = fs.readFileSync("src/components/daily-mass/DailyMassView.tsx", "utf8");
const panel = fs.readFileSync("src/components/daily-mass/DailyMassCalendarPanel.tsx", "utf8");
assert.equal(page.includes("RelatedLinks"), false);
assert.equal(page.includes("Keep exploring"), false);
assert.equal(page.includes("nextSunday"), false);
assert.equal(fs.existsSync("src/components/daily-mass/MiniMonthCalendar.tsx"), false);
assert.equal(view.includes("Next Sunday"), false);
assert.equal(view.includes("Family talk questions written by CatholicKidsCrafts"), false);
assert.equal(view.includes("daily_mass.sources"), false);
assert.equal(panel.includes("Family talk questions written by CatholicKidsCrafts"), false);
assert.equal(panel.includes("links only"), false);
assert.match(panel, /\/daily-mass\?date=/);
assert.match(panel, /GospelReadingCalendar/);
assert.match(panel, /deriveVestmentColor/);
assert.match(view, /GospelTypingSection/);
assert.match(view, /aria-expanded/);
assert.match(panel, /bible\.usccb\.org|usccbUrl/);
assert.match(view, /FaithJournalBanner/);

// Universalis caches jsonpmass.js for days; each day needs its own URL so the browser can't replay an old day.
assert.equal(
  universalisJsonpUrlClient("Europe.England", "2026-11-10"),
  "https://universalis.com/Europe.England/jsonpmass.js?d=20261110",
);
const typing = fs.readFileSync("src/components/gospel/GospelTypingSection.tsx", "utf8");
assert.equal(typing.includes("Select today"), false);
assert.equal(view.includes("Typing practice uses today's readings"), false);
assert.match(typing, /dateKey: readingsDateKey/);
assert.match(view, /useState\(\{ calendar: false, typing: false, journal: false \}\)/);

console.log("test-daily-mass-calendar: ok");
