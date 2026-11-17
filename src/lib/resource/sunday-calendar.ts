// Server-only Sunday calendar helpers for Printables Option E (romcal via toSheetKey).
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import { toSheetKey, type RomcalCountry } from "@/lib/sheet-keys";
import { RESOURCE_SEASONS, sheetSeason } from "@/lib/resource/sheets";
import type { SundayCalendarEntry } from "@/lib/resource/sunday-season-jumps";

const DAY = 86_400_000;

export type { SundayCalendarEntry };
export { SUNDAY_SEASON_JUMPS } from "@/lib/resource/sunday-season-jumps";

/** Upcoming Sundays from `fromSunday` (inclusive), with sheet metadata when the catalog has it. */
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
    try {
      const key = toSheetKey(date, country);
      const sheet = getSundaySheet(key);
      if (!sheet) continue;
      const season = sheetSeason(sheet);
      out.push({
        date,
        key,
        liturgicalName: sheet.liturgicalName,
        season,
        seasonLabel: RESOURCE_SEASONS.find((s) => s.id === season)?.label ?? sheet.season,
        color: sheet.color,
      });
    } catch {
      /* romcal gap */
    }
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
