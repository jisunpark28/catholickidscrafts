// Static Sunday sheet content keyed by sheetKey (see src/lib/sheet-keys).
// Generated from the TOC spreadsheet by scripts/build-sunday-sheets.ts; no DB.
import { SUNDAY_SHEETS } from "@/data/sunday-sheets";
import type { GospelSheetLevel } from "@/lib/gospel-sheet-schema";
import type { GospelSheetView } from "@/lib/gospel-sheet";

export type SundaySheetLevelContent = GospelSheetLevel & {
  /** Vocabulary words from the spreadsheet. Kept for later; not rendered yet. */
  words: string[];
};

export type SundaySheetArt = {
  /** Planned asset file names (no images exist yet). */
  main: string;
  heart: string;
  icons: string[];
  mainBrief: string;
  heartBrief: string;
};

export type SundaySheetContent = {
  key: string;
  liturgicalName: string;
  season: string;
  gospelRef: string;
  keyVerseDR: string;
  color: string;
  levels: { level1: SundaySheetLevelContent; level2: SundaySheetLevelContent };
  art: SundaySheetArt;
};

const COLOR_HEX: Record<string, string> = {
  green: "#3f8f4f",
  violet: "#7a4fa0",
  white: "#f4efe6",
  red: "#c0392b",
  rose: "#e48fa8",
  gold: "#d4a63a",
};

export function getSundaySheet(key: string): SundaySheetContent | null {
  return SUNDAY_SHEETS[key] ?? null;
}

export function listSundaySheetKeys(): string[] {
  return Object.keys(SUNDAY_SHEETS).sort();
}

function formatSundayLabel(ymd: string): string {
  return new Date(`${ymd}T00:00:00.000Z`).toLocaleDateString("en-CA", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Adapts static content to the existing GospelSheet component's view type. */
export function toGospelSheetView(sheet: SundaySheetContent, sundayDate?: string): GospelSheetView {
  return {
    id: sheet.key,
    slug: sheet.key.toLowerCase(),
    sundayDate: sundayDate ?? "",
    sundayLabel: sundayDate ? formatSundayLabel(sundayDate) : sheet.key,
    liturgicalName: sheet.liturgicalName,
    gospelRef: sheet.gospelRef,
    usccbUrl: sundayDate
      ? `https://bible.usccb.org/bible/readings/${sundayDate.slice(5, 7)}${sundayDate.slice(8, 10)}${sundayDate.slice(2, 4)}.cfm`
      : "",
    color: sheet.color,
    dotColor: COLOR_HEX[sheet.color] ?? "#c9c1b6",
    published: true,
    featured: false,
    levels: { level1: sheet.levels.level1, level2: sheet.levels.level2 },
  };
}
