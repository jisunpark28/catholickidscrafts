import romcal from "romcal";
// Server-only: romcal compiles lodash templates with `new Function()`. If this
// module is imported from a Client Component, enforcing CSP (no `'unsafe-eval'`)
// throws EvalError and Next.js shows "Application error".
import { toDateKey } from "@/lib/dates";
import {
  normalizeLiturgicalTitleStyle,
  rankFromTitle,
} from "@/lib/liturgical-calendar";
import { COUNTRY_CONFIG, enabledOrFallback, type RomcalCountry } from "@/lib/sheet-keys/countries";
import type { MassDaySummary } from "@/types/mass";

type RomcalEntry = {
  moment: string;
  key?: string;
  type: string;
  name: string;
  data?: { meta?: { liturgicalColor?: { key?: string } } };
};

const yearIndexCache = new Map<number, Map<string, RomcalEntry>>();

function rankFromRomcalType(type: string): MassDaySummary["rank"] {
  switch (type.toUpperCase()) {
    case "SOLEMNITY":
      return "solemnity";
    case "FEAST":
      return "feast";
    case "MEMORIAL":
    case "OPT_MEMORIAL":
      return "memorial";
    case "SUNDAY":
      return "sunday";
    default:
      return "ferial";
  }
}

function getYearIndex(year: number): Map<string, RomcalEntry> {
  let index = yearIndexCache.get(year);
  if (!index) {
    const cal = romcal.calendarFor({ year, locale: "en" }) as RomcalEntry[];
    index = new Map();
    for (const entry of cal) {
      const key = toDateKey(new Date(entry.moment));
      index.set(key, entry);
    }
    yearIndexCache.set(year, index);
  }
  return index;
}

/** Preload Romcal index for a calendar year (cheap after first call). */
export function preloadRomcalYear(year: number): void {
  getYearIndex(year);
}

export function getRomcalDaySummary(date: Date): MassDaySummary | null {
  const key = toDateKey(date);
  const entry = getYearIndex(date.getUTCFullYear()).get(key);
  if (!entry?.name?.trim()) return null;

  const liturgicalTitle = normalizeLiturgicalTitleStyle(entry.name);
  const rank = rankFromRomcalType(entry.type);
  const titleRank = rankFromTitle(liturgicalTitle);
  const resolvedRank =
    rank !== "ferial" || titleRank !== "ferial" ? (rank !== "ferial" ? rank : titleRank) : "ferial";

  return {
    date: key,
    liturgicalTitle,
    rank: resolvedRank,
  };
}

/** Romcal's celebration type (e.g. MEMORIAL, OPT_MEMORIAL), name and color key for a date. */
export function getRomcalDayHint(date: Date): { type: string; name: string; colorKey: string } | null {
  const entry = getYearIndex(date.getUTCFullYear()).get(toDateKey(date));
  if (!entry) return null;
  return {
    type: (entry.type ?? "").toUpperCase(),
    name: entry.name?.trim() ?? "",
    colorKey: (entry.data?.meta?.liturgicalColor?.key ?? "").toUpperCase(),
  };
}

export function getRomcalLiturgicalTitle(date: Date): string {
  return getRomcalDaySummary(date)?.liturgicalTitle ?? "";
}

/** Romcal's winning celebration for a day in one national calendar. */
export type RomcalCelebration = {
  /** YYYY-MM-DD */
  date: string;
  /** romcal key, e.g. "saintLeoTheGreatPopeAndDoctor". */
  key: string;
  /** e.g. MEMORIAL, OPT_MEMORIAL, FEAST, SOLEMNITY, SUNDAY, FERIA. */
  type: string;
  /** Full romcal name, e.g. "Saint Margaret of Scotland/Saint Gertrude the Great, Virgin". */
  name: string;
  /** `name` split into one entry per celebration (romcal joins optional memorials with "/"). */
  names: string[];
  colorKey: string;
};

const countryYearCache = new Map<string, Map<string, RomcalEntry>>();

/** First (winning) entry per day, same romcal options as the Sunday sheets (lib/sheet-keys). */
function countryYearIndex(country: RomcalCountry, year: number): Map<string, RomcalEntry> {
  const cacheKey = `${country}:${year}`;
  let index = countryYearCache.get(cacheKey);
  if (!index) {
    const cfg = COUNTRY_CONFIG[country];
    const calendarFor = romcal.calendarFor as unknown as (o: Record<string, unknown>) => RomcalEntry[];
    const cal = calendarFor({
      year,
      locale: "en",
      ...(cfg.romcal === "general" ? {} : { country: cfg.romcal }),
      ascensionOnSunday: cfg.ascensionOnSunday,
    });
    index = new Map();
    for (const entry of cal) {
      const day = String(entry.moment).slice(0, 10);
      if (!index.has(day)) index.set(day, entry);
    }
    countryYearCache.set(cacheKey, index);
  }
  return index;
}

/**
 * "A/B", "A Or B" and "Saint A and Saint B" -> ["A", "B"].
 * Joint feasts like "Saints Fabian, Pope, and Sebastian, Martyrs" stay whole.
 */
export function splitCelebrationNames(name: string): string[] {
  return name
    .split("/")
    .flatMap((part) => part.split(/,?\s+(?:and|or)\s+(?=Saints?\s|Blessed\s)/i))
    .map((part) => part.trim().replace(/,$/, ""))
    .filter(Boolean);
}

/**
 * Country-aware getRomcalDayHint: the winning celebration on `ymd` (YYYY-MM-DD) in the romcal
 * calendar for `country` (canada, unitedStates; anything else uses the General Roman Calendar).
 * Null if romcal has no entry or fails.
 */
export function getRomcalCelebration(ymd: string, country: RomcalCountry): RomcalCelebration | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  try {
    const entry = countryYearIndex(enabledOrFallback(country), Number(ymd.slice(0, 4))).get(ymd);
    if (!entry) return null;
    const name = entry.name?.trim() ?? "";
    return {
      date: ymd,
      key: entry.key ?? "",
      type: (entry.type ?? "").toUpperCase(),
      name,
      names: splitCelebrationNames(name),
      colorKey: (entry.data?.meta?.liturgicalColor?.key ?? "").toUpperCase(),
    };
  } catch (e) {
    console.error("[romcal] calendar failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Days (YYYY-MM-DD) in a civil year whose winning romcal celebration has one of `keys`. */
export function romcalDatesForKeys(keys: readonly string[], country: RomcalCountry, year: number): string[] {
  if (!keys.length) return [];
  try {
    const out: string[] = [];
    for (const [day, entry] of countryYearIndex(enabledOrFallback(country), year)) {
      if (entry.key && keys.includes(entry.key)) out.push(day);
    }
    return out.sort();
  } catch (e) {
    console.error("[romcal] calendar failed:", e instanceof Error ? e.message : e);
    return [];
  }
}
