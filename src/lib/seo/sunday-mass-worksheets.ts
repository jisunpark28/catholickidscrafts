import {
  keyToSlug,
  RESOURCE_SEASONS,
  seasonPath,
  sheetSeason,
  type ResourceSeason,
} from "@/lib/resource/sheets";
import { getSundaySheet, listSundaySheetKeys, type SundaySheetContent } from "@/lib/sunday-sheet-content";

export const SUNDAY_MASS_WORKSHEETS_HUB = "/sunday-mass-worksheets";

export function sundayMassWorksheetPath(key: string): string {
  return `${SUNDAY_MASS_WORKSHEETS_HUB}/${keyToSlug(key)}`;
}

/** Prefer sheet Level 1 questions, then Level 2, so every page has 3 unique prompts from that week. */
export function sheetConversationQuestions(sheet: SundaySheetContent): [string, string, string] {
  const l1 = sheet.levels.level1.questions;
  const l2 = sheet.levels.level2.questions;
  const pool = [...l1, ...l2].map((q) => q.trim()).filter(Boolean);
  const q1 = pool[0] ?? `What did you hear in ${sheet.gospelRef} today?`;
  const q2 = pool[1] ?? `How does "${sheet.levels.level1.keyLine}" speak to our family this week?`;
  const q3 =
    pool[2] ??
    `What is one small way we can live "${sheet.levels.level1.title}" before next Sunday?`;
  return [q1, q2, q3];
}

export type SeasonSheetGroup = {
  season: ResourceSeason;
  label: string;
  seasonHref: string;
  sheets: SundaySheetContent[];
};

/** All Sunday sheets grouped by liturgical season, Advent first. */
export function sheetsGroupedBySeason(): SeasonSheetGroup[] {
  const buckets = new Map<ResourceSeason, SundaySheetContent[]>();
  for (const key of listSundaySheetKeys()) {
    const sheet = getSundaySheet(key);
    if (!sheet) continue;
    const season = sheetSeason(sheet);
    const list = buckets.get(season) ?? [];
    list.push(sheet);
    buckets.set(season, list);
  }
  return RESOURCE_SEASONS.map((s) => {
    const sheets = (buckets.get(s.id) ?? []).sort((a, b) =>
      a.key.localeCompare(b.key, "en", { numeric: true }),
    );
    return {
      season: s.id,
      label: s.label,
      seasonHref: seasonPath(s.id),
      sheets,
    };
  }).filter((g) => g.sheets.length > 0);
}
