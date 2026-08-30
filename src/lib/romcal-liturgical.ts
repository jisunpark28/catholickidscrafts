import romcal from "romcal";
import { toDateKey } from "@/lib/dates";
import {
  normalizeLiturgicalTitleStyle,
  rankFromTitle,
} from "@/lib/liturgical-calendar";
import type { MassDaySummary } from "@/types/mass";

type RomcalEntry = {
  moment: string;
  type: string;
  name: string;
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

export function getRomcalLiturgicalTitle(date: Date): string {
  return getRomcalDaySummary(date)?.liturgicalTitle ?? "";
}
