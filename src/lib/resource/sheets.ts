// Resource library: search and URL helpers over the static Sunday sheets.
// DB-free and romcal-free, so it is safe for static pages and the sitemap.
import { getSundaySheet, listSundaySheetKeys, type SundaySheetContent } from "@/lib/sunday-sheet-content";

export const RESOURCE_PATH = "/resource";

export type ResourceYear = "A" | "B" | "C";
export const RESOURCE_YEARS: readonly ResourceYear[] = ["A", "B", "C"];

export const RESOURCE_SEASONS = [
  { id: "advent", label: "Advent" },
  { id: "christmas", label: "Christmas" },
  { id: "lent", label: "Lent" },
  { id: "easter", label: "Easter" },
  { id: "ordinary", label: "Ordinary Time" },
  { id: "feasts", label: "Feasts & Solemnities" },
] as const;
export type ResourceSeason = (typeof RESOURCE_SEASONS)[number]["id"];

/** Season order for listing results in liturgical-year order. */
const SEASON_ORDER: Record<ResourceSeason, number> = {
  advent: 0,
  christmas: 1,
  lent: 2,
  easter: 3,
  ordinary: 4,
  feasts: 5,
};

/** "A_OT30" -> "a-ot30". Keys only use one "_" and never "-", so this is reversible. */
export function keyToSlug(key: string): string {
  return key.toLowerCase().replace(/_/g, "-");
}

/** "a-ot30" -> "A_OT30" when that sheet exists, else null. */
export function slugToKey(slug: string): string | null {
  const key = slug.trim().toUpperCase().replace(/-/g, "_");
  if (!/^[A-Z0-9_]{2,30}$/.test(key)) return null;
  return getSundaySheet(key) ? key : null;
}

export function resourcePath(key: string, level?: 1 | 2): string {
  return `${RESOURCE_PATH}/${keyToSlug(key)}${level === 2 ? "?level=2" : ""}`;
}

export function resourcePrintPath(key: string, level: 1 | 2, autoPrint = false): string {
  return `/print/resource/${keyToSlug(key)}?level=${level}${autoPrint ? "&autoprint=1" : ""}`;
}

/** Year A/B/C, or null for sheets shared by every year (XMAS2, SOL_*). */
export function sheetYear(key: string): ResourceYear | null {
  const m = /^([ABC])_/.exec(key);
  return m ? (m[1] as ResourceYear) : null;
}

export function sheetSeason(sheet: SundaySheetContent): ResourceSeason {
  if (sheet.key.startsWith("SOL_")) return "feasts";
  switch (sheet.season) {
    case "Advent":
      return "advent";
    case "Christmas":
    case "Sunday (Christmas season)":
      return "christmas";
    case "Lent":
    case "Holy Week":
      return "lent";
    case "Easter":
      return "easter";
    default:
      return "ordinary";
  }
}

export function seasonLabel(id: ResourceSeason): string {
  return RESOURCE_SEASONS.find((s) => s.id === id)?.label ?? "";
}

/** Indexable season hub: `/resources/lent`, `/resources/advent`, … */
export function seasonPath(id: ResourceSeason): string {
  return `/resources/${id}`;
}

export function yearLabel(key: string): string {
  const y = sheetYear(key);
  return y ? `Year ${y}` : "Every year";
}

export function parseYear(v: string | undefined): ResourceYear | null {
  const u = v?.toUpperCase();
  return u === "A" || u === "B" || u === "C" ? u : null;
}

export function parseSeason(v: string | undefined): ResourceSeason | null {
  return RESOURCE_SEASONS.some((s) => s.id === v) ? (v as ResourceSeason) : null;
}

export type ResourceCard = {
  key: string;
  slug: string;
  title: string;
  liturgicalName: string;
  gospelRef: string;
  yearLabel: string;
  season: ResourceSeason;
  color: string;
};

export function toCard(sheet: SundaySheetContent, level: 1 | 2): ResourceCard {
  const c = level === 2 ? sheet.levels.level2 : sheet.levels.level1;
  return {
    key: sheet.key,
    slug: keyToSlug(sheet.key),
    title: c.title,
    liturgicalName: sheet.liturgicalName,
    gospelRef: sheet.gospelRef,
    yearLabel: yearLabel(sheet.key),
    season: sheetSeason(sheet),
    color: sheet.color,
  };
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9: ]+/g, " ");
}

/** Relevance: title / liturgical name / Gospel ref weigh more than story text. 0 = no match. */
function score(sheet: SundaySheetContent, terms: string[]): number {
  const l1 = sheet.levels.level1;
  const l2 = sheet.levels.level2;
  const strong = norm([sheet.liturgicalName, sheet.gospelRef, l1.title, l2.title, l1.keyLine, l2.keyLine].join(" "));
  const weak = norm([sheet.keyVerseDR, l1.story, l2.story, ...l1.words, ...l2.words, l1.prayer, l2.prayer].join(" "));
  let total = 0;
  for (const t of terms) {
    const s = strong.includes(t) ? 3 : 0;
    const w = weak.includes(t) ? 1 : 0;
    if (!s && !w) return 0;
    total += s + w;
  }
  return total;
}

export type ResourceQuery = { q?: string; year?: ResourceYear | null; season?: ResourceSeason | null };

/** Sheets matching every search term plus the year/season filters. */
export function searchSheets({ q, year, season }: ResourceQuery): SundaySheetContent[] {
  const terms = norm(q ?? "")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 8);
  const rows: { sheet: SundaySheetContent; s: number }[] = [];
  for (const key of listSundaySheetKeys()) {
    const sheet = getSundaySheet(key);
    if (!sheet) continue;
    const y = sheetYear(key);
    if (year && y && y !== year) continue;
    if (season && sheetSeason(sheet) !== season) continue;
    const s = terms.length ? score(sheet, terms) : 1;
    if (s > 0) rows.push({ sheet, s });
  }
  return rows
    .sort(
      (a, b) =>
        b.s - a.s ||
        SEASON_ORDER[sheetSeason(a.sheet)] - SEASON_ORDER[sheetSeason(b.sheet)] ||
        a.sheet.key.localeCompare(b.sheet.key, "en", { numeric: true }),
    )
    .map((r) => r.sheet);
}

/** Plain-language page description for SEO (no ages). */
export function sheetDescription(sheet: SundaySheetContent): string {
  const l1 = sheet.levels.level1.title;
  const l2 = sheet.levels.level2.title;
  return `Free printable Gospel worksheet for Catholic kids: ${sheet.liturgicalName} (${yearLabel(
    sheet.key,
  )}), ${sheet.gospelRef}. Level 1 “${l1}” and Level 2 “${l2}” with Gospel story, key line, activity, questions and prayer.`;
}

/**
 * Keyword title for weekly landings, e.g.
 * "Free Printable Gospel Sheet - Year A 30th Sunday in Ordinary Time"
 */
export function sheetSeoTitle(sheet: SundaySheetContent): string {
  return `Free Printable Gospel Sheet - ${yearLabel(sheet.key)} ${sheet.liturgicalName}`;
}

/** Visible H1 aligned with the title (liturgical name first for scanability). */
export function sheetSeoH1(sheet: SundaySheetContent): string {
  return `Free Printable Gospel Sheet: ${sheet.liturgicalName} (${yearLabel(sheet.key)})`;
}

/**
 * Season hub title, e.g. "Lent Gospel Worksheet for Kids Level 1 & Level 2"
 */
export function seasonSeoTitle(id: ResourceSeason): string {
  return `${seasonLabel(id)} Gospel Worksheet for Kids Level 1 & Level 2`;
}

export function seasonSeoDescription(id: ResourceSeason, sheetCount: number): string {
  const label = seasonLabel(id);
  return `Free printable ${label} Gospel worksheets for Catholic kids and catechists. Browse ${sheetCount} Sunday and feast sheets with Level 1 and Level 2 — story, activity, questions and prayer. Print this Sunday free; Plus unlocks the full library.`;
}
