import { getEvergreenPage } from "@/lib/evergreen-catalog";
import {
  isActivityFreeInWeekOf,
  listActivities,
  torontoDate,
  type ResourceActivity,
} from "@/lib/resource/activities";
import { searchSheets, seasonLabel, type ResourceSeason } from "@/lib/resource/sheets";
import { nextSeasonSunday, SUNDAY_SEASON_JUMPS, type SundayCalendarEntry } from "@/lib/resource/sunday-season-jumps";
import { getSundaySheet, type SundaySheetContent } from "@/lib/sunday-sheet-content";

export type WorksheetFilter = "free-week" | "christ-the-king" | "mass" | "virtue" | "";

export function parseWorksheetFilter(raw: string | undefined): WorksheetFilter {
  if (raw === "free-week" || raw === "christ-the-king" || raw === "mass" || raw === "virtue") return raw;
  return "";
}

function matchesQuery(
  hay: string,
  q: string,
): boolean {
  const terms = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);
  if (!terms.length) return true;
  const n = hay.toLowerCase();
  return terms.every((t) => n.includes(t));
}

function activityMatches(activity: ResourceActivity, q: string): boolean {
  return matchesQuery(
    `${activity.title} ${activity.kind} ${activity.summary} ${activity.keywords.join(" ")} ${activity.seasons.join(" ")}`,
    q,
  );
}

export type WorksheetBrowse = {
  sheets: SundaySheetContent[];
  activities: ResourceActivity[];
  heading: string;
};

/**
 * Worksheets-panel browse/search (Sunday + evergreen sheets, plus activity worksheets).
 * Cards stay in Cards mode; this list never includes them.
 */
export function listWorksheetBrowse({
  q = "",
  season = null,
  filter = "",
  thisSundayKey = null,
  weekYmd,
}: {
  q?: string;
  season?: ResourceSeason | null;
  filter?: WorksheetFilter;
  thisSundayKey?: string | null;
  weekYmd?: string;
}): WorksheetBrowse {
  const query = q.trim();
  const ymd = weekYmd ?? torontoDate();
  let sheets: SundaySheetContent[] = [];
  let activities: ResourceActivity[] = [];
  let heading = "Worksheets";

  if (filter === "free-week") {
    const sunday = thisSundayKey ? getSundaySheet(thisSundayKey) : null;
    sheets = sunday ? [sunday] : [];
    activities = listActivities().filter((a) => isActivityFreeInWeekOf(a, ymd));
    heading = "This week free worksheets";
  } else if (filter === "mass") {
    sheets = searchSheets({}).filter((s) => getEvergreenPage(s.key)?.kind === "mass");
    heading = "Mass worksheets";
  } else if (filter === "virtue") {
    sheets = searchSheets({}).filter((s) => getEvergreenPage(s.key)?.kind === "virtue");
    heading = "Virtue worksheets";
  } else if (filter === "christ-the-king") {
    sheets = searchSheets({}).filter((s) => s.key.endsWith("_OT34") || s.key === "OT34");
    heading = "Christ the King worksheets";
  } else if (season) {
    sheets = searchSheets({ season, q: query });
    activities = listActivities(season);
    heading = `${seasonLabel(season)} worksheets`;
  } else if (query) {
    sheets = searchSheets({ q: query });
    activities = listActivities().filter((a) => activityMatches(a, query));
    heading = `Results for “${query}”`;
  }

  if (query && filter) {
    const allowed = new Set(searchSheets({ q: query }).map((s) => s.key));
    sheets = sheets.filter((s) => allowed.has(s.key));
    activities = activities.filter((a) => activityMatches(a, query));
    heading = `Results for “${query}”`;
  } else if (query && season) {
    activities = activities.filter((a) => activityMatches(a, query));
  }

  return { sheets, activities, heading };
}

/** Date that should seed the Worksheets calendar month for the active browse chip. */
export function worksheetCalendarMonthDate({
  sundays,
  thisSundayDate,
  selectedDate,
  season,
  filter,
}: {
  sundays: SundayCalendarEntry[];
  thisSundayDate: string;
  selectedDate: string;
  season?: ResourceSeason | null;
  filter?: WorksheetFilter;
}): string {
  if (filter === "free-week") return thisSundayDate || selectedDate;
  const jump =
    filter === "christ-the-king"
      ? SUNDAY_SEASON_JUMPS.find((j) => j.id === "christ-the-king")
      : season
        ? SUNDAY_SEASON_JUMPS.find((j) => j.season === season)
        : undefined;
  if (jump) {
    const hit = nextSeasonSunday(sundays, thisSundayDate, jump);
    if (hit) return hit.date;
  }
  return selectedDate || thisSundayDate;
}
