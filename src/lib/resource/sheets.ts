// Resource library: search and URL helpers over the static Sunday sheets.
// DB-free and romcal-free, so it is safe for static pages and the sitemap.
import { SHARED_KEYS, SUNDAY_KEYS } from "@/lib/sheet-keys/keys";
import { getSundaySheet, listSundaySheetKeys, type SundaySheetContent } from "@/lib/sunday-sheet-content";

export const RESOURCE_PATH = "/resource";

export type ResourceYear = "A" | "B" | "C";
export const RESOURCE_YEARS: readonly ResourceYear[] = ["A", "B", "C"];

export const RESOURCE_SEASONS = [
  { id: "advent", label: "Advent" },
  { id: "christmas", label: "Christmas" },
  { id: "lent", label: "Lent" },
  { id: "easter", label: "Easter" },
  { id: "ordinary-time", label: "Ordinary Time" },
  { id: "feasts", label: "Feasts & Solemnities" },
] as const;
export type ResourceSeason = (typeof RESOURCE_SEASONS)[number]["id"];

/** Season order for listing results in liturgical-year order. */
const SEASON_ORDER: Record<ResourceSeason, number> = {
  advent: 0,
  christmas: 1,
  lent: 2,
  easter: 3,
  "ordinary-time": 4,
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
      return "ordinary-time";
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

/** Accepts canonical ids plus legacy `ordinary` → `ordinary-time`. */
export function parseSeason(v: string | undefined): ResourceSeason | null {
  if (!v) return null;
  if (v === "ordinary") return "ordinary-time";
  return RESOURCE_SEASONS.some((s) => s.id === v) ? (v as ResourceSeason) : null;
}

/** Level 1 title stands in for gospel theme (no separate theme column in sheet JSON). */
export function sheetGospelTheme(sheet: SundaySheetContent): string {
  return sheet.levels.level1.title;
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

/**
 * Meta description, e.g.
 * Free printable Catholic Sunday worksheet for 30th Sunday… Includes Matthew 22:34-40 (Love God…) …
 */
export function sheetDescription(sheet: SundaySheetContent): string {
  const theme = sheetGospelTheme(sheet);
  return `Free printable Catholic Sunday worksheet for ${sheet.liturgicalName} (${yearLabel(
    sheet.key,
  )}). Includes ${sheet.gospelRef} (${theme}) story, Level 1 & Level 2 reflection questions for CCD teachers & homeschooling.`;
}

export const SEO_TITLE_MAX = 60;
const SITE_SUFFIX = " | Catholic Kids Crafts";

/** Liturgical name without parenthetical notes, e.g. "2nd Sunday of Easter (Divine Mercy)" → "2nd Sunday of Easter". */
function shortLiturgicalName(name: string): string {
  const plain = name.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  // "34th Sunday: Our Lord Jesus Christ, King of the Universe" → the feast name.
  const m = /^\d+\w* Sunday: (.+)$/.exec(plain);
  return m ? m[1]! : plain;
}

function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > 20 ? cut.slice(0, i) : cut).replace(/[\s,:;–-]+$/, "")}…`;
}

/** First candidate that fits the SERP limit; adds the site name when there is room. */
function fitTitle(candidates: string[]): string {
  const best = candidates.find((c) => c.length <= SEO_TITLE_MAX);
  if (!best) return truncateWords(candidates[candidates.length - 1]!, SEO_TITLE_MAX);
  return best.length + SITE_SUFFIX.length <= SEO_TITLE_MAX ? best + SITE_SUFFIX : best;
}

/**
 * Absolute meta title ≤ 60 chars (use with `absoluteTitle: true`), e.g.
 * "1st Sunday of Advent (Year A) Gospel Worksheet for Kids"
 */
export function sheetSeoTitle(sheet: SundaySheetContent): string {
  const name = shortLiturgicalName(sheet.liturgicalName);
  const y = sheetYear(sheet.key);
  const withYear = y ? `${name} (Year ${y})` : name;
  return fitTitle([
    `${withYear} Gospel Worksheet for Kids`,
    `${withYear} Gospel Worksheet`,
    `${withYear} Kids Worksheet`,
    `${name} Gospel Worksheet`,
    withYear,
  ]);
}

/** JSON-LD abstract: Level 1 story, trimmed to ~300 chars at a word boundary. */
export function sheetAbstract(sheet: SundaySheetContent): string {
  const story = sheet.levels.level1.story.replace(/\s+/g, " ").trim();
  if (story.length <= 300) return story;
  const cut = story.slice(0, 299);
  const i = cut.lastIndexOf(" ");
  return `${i > 200 ? cut.slice(0, i) : cut}…`;
}

/** Visible H1 (spec: no gospel ref in H1). */
export function sheetSeoH1(sheet: SundaySheetContent): string {
  return `Free Catholic Sunday Gospel Sheet: ${sheet.liturgicalName} (${yearLabel(sheet.key)})`;
}

/** Visible H2 under the H1. */
export function sheetSeoH2(sheet: SundaySheetContent): string {
  return `Gospel Reading: ${sheet.gospelRef} - ${sheetGospelTheme(sheet)}`;
}

/**
 * Previous / next sheet in TOC order (same cycle, or shared-feast list).
 * Neighbors only exist when that key is in the static content map.
 */
export function sheetNeighbors(key: string): { prev: string | null; next: string | null } {
  const year = sheetYear(key);
  const chain =
    year != null
      ? SUNDAY_KEYS.map((k) => `${year}_${k}`).filter((k) => getSundaySheet(k))
      : SHARED_KEYS.filter((k) => getSundaySheet(k));
  const i = chain.indexOf(key);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? chain[i - 1]! : null,
    next: i < chain.length - 1 ? chain[i + 1]! : null,
  };
}

/** Season hub heading, e.g. "Lent Gospel Worksheets for Kids". */
export function seasonSeoTitle(id: ResourceSeason): string {
  return `${seasonLabel(id)} Gospel Worksheets for Kids`;
}

/** Absolute meta title ≤ 60 chars for a season hub (use with `absoluteTitle: true`). */
export function seasonMetaTitle(id: ResourceSeason): string {
  return fitTitle([
    `${seasonLabel(id)} Gospel Worksheets for Kids, Levels 1 & 2`,
    seasonSeoTitle(id),
  ]);
}

export function seasonSeoDescription(id: ResourceSeason, sheetCount: number): string {
  const label = seasonLabel(id);
  return `Free printable ${label} Gospel worksheets for Catholic kids and catechists. Browse ${sheetCount} Sunday and feast sheets with Level 1 and Level 2 — story, activity, questions and prayer. Print this Sunday free; Plus unlocks the full library.`;
}
