import {
  keyToSlug,
  RESOURCE_SEASONS,
  seasonPath,
  sheetSeason,
  sheetYear,
  slugToKey,
  type ResourceSeason,
} from "@/lib/resource/sheets";
import { getSundaySheet, listSundaySheetKeys, type SundaySheetContent } from "@/lib/sunday-sheet-content";

export const SUNDAY_MASS_WORKSHEETS_HUB = "/sunday-mass-worksheets";

/** Public slugs only. Internal resource/edit/print URLs must keep keyToSlug. */
function titleSlug(title: string): string {
  return title.toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const bases = listSundaySheetKeys().map((key) => {
  const sheet = getSundaySheet(key)!;
  const year = sheetYear(key);
  const name = titleSlug(sheet.liturgicalName) || keyToSlug(key);
  return { key, base: year ? name + "-year-" + year.toLowerCase() : name };
});
const counts = new Map<string, number>();
for (const { base } of bases) counts.set(base, (counts.get(base) ?? 0) + 1);
const reserved = new Set(bases.map(({ base }) => base));
const SLUG_BY_KEY = new Map<string, string>();
const KEY_BY_SLUG = new Map<string, string>();
for (const { key, base } of bases) {
  let slug = base;
  if ((counts.get(base) ?? 0) > 1) {
    const suffix = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    slug = base + "-" + suffix;
    let n = 2;
    while (reserved.has(slug) || KEY_BY_SLUG.has(slug)) slug = base + "-" + suffix + "-" + n++;
  }
  SLUG_BY_KEY.set(key, slug);
  KEY_BY_SLUG.set(slug, key);
}

export function sundayMassWorksheetSlug(key: string): string {
  const slug = SLUG_BY_KEY.get(key);
  if (!slug) throw new Error("Unknown Sunday worksheet key: " + key);
  return slug;
}

/** Accept old public key URLs as aliases, never as the canonical public path. */
export function sundayMassWorksheetKey(slug: string): string | null {
  return KEY_BY_SLUG.get(slug) ?? slugToKey(slug);
}

export function sundayMassWorksheetPath(key: string): string {
  return SUNDAY_MASS_WORKSHEETS_HUB + "/" + sundayMassWorksheetSlug(key);
}

export type WorksheetSearchParams = Record<string, string | string[] | undefined>;

/** Only used by the PUBLIC worksheet route; preserves repeated query parameters. */
export function sundayMassWorksheetRedirect(slug: string, search: WorksheetSearchParams = {}): string | null {
  const key = sundayMassWorksheetKey(slug);
  if (!key || slug === sundayMassWorksheetSlug(key)) return null;
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(search)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(name, item);
    }
  }
  const qs = query.toString();
  return sundayMassWorksheetPath(key) + (qs ? "?" + qs : "");
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
