// Server-only Sunday calendar helpers for Printables Option E (romcal via toSheetKey).
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import { toSheetKey, type RomcalCountry } from "@/lib/sheet-keys";
import { RESOURCE_SEASONS, sheetSeason } from "@/lib/resource/sheets";
import type { SundayCalendarEntry } from "@/lib/resource/sunday-season-jumps";

const DAY = 86_400_000;

/** Weeks before/after "this Sunday" for the Printables month calendar (past + future). */
export const SUNDAY_CALENDAR_WEEKS_BEFORE = 260; // ~5 years
export const SUNDAY_CALENDAR_WEEKS_AFTER = 156; // ~3 years

export type { SundayCalendarEntry };
export { SUNDAY_SEASON_JUMPS } from "@/lib/resource/sunday-season-jumps";

function entryFromDate(date: string, country: RomcalCountry): SundayCalendarEntry | null {
  try {
    if (new Date(`${date}T00:00:00Z`).getUTCDay() !== 0) return null;
    const key = toSheetKey(date, country);
    const sheet = getSundaySheet(key);
    if (!sheet) return null;
    const season = sheetSeason(sheet);
    return {
      date,
      key,
      liturgicalName: sheet.liturgicalName,
      season,
      seasonLabel: RESOURCE_SEASONS.find((s) => s.id === season)?.label ?? sheet.season,
      color: sheet.color,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve a calendar Sunday (past or future) to its library worksheet via romcal Year A/B/C.
 * Returns null for non-Sundays or dates with no catalog sheet.
 */
export function resolveSundayEntry(date: string, country: RomcalCountry): SundayCalendarEntry | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return entryFromDate(date, country);
}

/** Sundays from `fromSunday` (inclusive) for `count` weeks, with sheet metadata when the catalog has it. */
export function listUpcomingSundays(
  country: RomcalCountry,
  fromSunday: string,
  count = 53,
): SundayCalendarEntry[] {
  const start = Date.parse(`${fromSunday}T00:00:00Z`);
  if (!Number.isFinite(start)) return [];
  const out: SundayCalendarEntry[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(start + i * 7 * DAY).toISOString().slice(0, 10);
    const entry = entryFromDate(date, country);
    if (entry) out.push(entry);
  }
  return out;
}

/**
 * Past + future Sundays around `centerSunday` for the Printables calendar.
 * Every catalog Sunday in range is selectable (not only this week / upcoming).
 */
export function listSundayCalendar(
  country: RomcalCountry,
  centerSunday: string,
  weeksBefore = SUNDAY_CALENDAR_WEEKS_BEFORE,
  weeksAfter = SUNDAY_CALENDAR_WEEKS_AFTER,
): SundayCalendarEntry[] {
  const center = Date.parse(`${centerSunday}T00:00:00Z`);
  if (!Number.isFinite(center)) return [];
  const start = center - weeksBefore * 7 * DAY;
  const count = weeksBefore + weeksAfter + 1;
  const out: SundayCalendarEntry[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(start + i * 7 * DAY).toISOString().slice(0, 10);
    const entry = entryFromDate(date, country);
    if (entry) out.push(entry);
  }
  return out;
}

/** Short kid/parent liturgical blurb from sheet fields (no separate CMS copy yet). */
export function sundayLiturgicalBlurb(sheet: {
  liturgicalName: string;
  season: string;
  gospelRef: string;
  color: string;
  levels: { level1: { title: string; keyLine: string; story: string } };
}): string {
  const story = sheet.levels.level1.story.replace(/\s+/g, " ").trim();
  const first = story.split(/(?<=[.!?])\s+/)[0] ?? story;
  const snippet = first.length > 220 ? `${first.slice(0, 217).replace(/\s+\S*$/, "")}…` : first;
  return `This Sunday is ${sheet.liturgicalName} (${sheet.season}). The Gospel is ${sheet.gospelRef} — ${sheet.levels.level1.title}. ${snippet}`;
}
