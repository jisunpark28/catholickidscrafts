/**
 * Advent Complete 2026 pack BOM (Year B). Plus-only landing over live sheets + activities.
 * Individual Option E / signin|plus gating is unchanged; this is a product-layer pack view.
 */
import {
  activityEditPath,
  activityPath,
  getActivity,
  type ResourceActivity,
} from "@/lib/resource/activities";
import { resourceEditPath } from "@/lib/resource/sheet-edit-path";
import { resourcePath, resourcePrintPath } from "@/lib/resource/sheets";
import { getSundaySheet } from "@/lib/sunday-sheet-content";

export const ADVENT_PACK_PATH = "/advent-complete-2026";
export const ADVENT_PACK_DATES = "Nov 29 – Dec 20, 2026";
export const ADVENT_PACK_DOWNLOAD_PATH = "/api/resource/advent-complete-2026/download";

export type AdventPackActivityRef = {
  slug: string;
  role: "craft" | "home" | "bonus";
  /** Ongoing across weeks (e.g. Jesse Tree in W4). */
  continued?: boolean;
  /** Shown on pack but not in the Advent Complete BOM. */
  outsidePack?: boolean;
};

export type AdventPackWeek = {
  id: string;
  label: string;
  dateLabel: string;
  sheetKey: string;
  items: AdventPackActivityRef[];
};

/** `all` or a week id from ADVENT_PACK_WEEKS / ADVENT_PACK_BONUS. */
export type AdventPackDownloadScope = "all" | string;

/** Live 8 + sheets + IC bonus. Wreath/calendar stay out (footer bridge only). */
export const ADVENT_PACK_WEEKS: readonly AdventPackWeek[] = [
  {
    id: "w1",
    label: "Week 1",
    dateLabel: "Nov 29",
    sheetKey: "B_ADV01",
    items: [
      { slug: "advent-candle-craft", role: "craft" },
      { slug: "come-lord-jesus", role: "home" },
    ],
  },
  {
    id: "w2",
    label: "Week 2",
    dateLabel: "Dec 6",
    sheetKey: "B_ADV02",
    items: [
      { slug: "advent-bank", role: "craft" },
      { slug: "straw-for-the-manger", role: "home" },
    ],
  },
  {
    id: "w3",
    label: "Week 3 · Gaudete",
    dateLabel: "Dec 13",
    sheetKey: "B_ADV03",
    items: [
      { slug: "advent-lantern", role: "craft" },
      { slug: "jesse-tree-picture-a-day", role: "home" },
    ],
  },
  {
    id: "w4",
    label: "Week 4",
    dateLabel: "Dec 20",
    sheetKey: "B_ADV04",
    items: [
      { slug: "fiat-flag", role: "craft" },
      { slug: "gabriel-wings", role: "craft" },
      { slug: "jesse-tree-picture-a-day", role: "home", continued: true },
    ],
  },
];

export const ADVENT_PACK_BONUS: AdventPackWeek = {
  id: "ic",
  label: "Dec 8 · Immaculate Conception",
  dateLabel: "Dec 8",
  sheetKey: "SOL_IMMACULATE",
  items: [
    { slug: "fiat-flag", role: "craft" },
    { slug: "white-flower-for-mary", role: "bonus", outsidePack: true },
  ],
};

export type AdventPackSheetLinks = {
  key: string;
  liturgicalName: string;
  gospelRef: string;
  l1Title: string;
  l2Title: string;
  openHref: string;
  printL1: string;
  printL2: string;
  editL1: string;
  editL2: string;
};

export function adventPackSheetLinks(key: string): AdventPackSheetLinks | null {
  const sheet = getSundaySheet(key);
  if (!sheet) return null;
  return {
    key,
    liturgicalName: sheet.liturgicalName,
    gospelRef: sheet.gospelRef,
    l1Title: sheet.levels.level1.title,
    l2Title: sheet.levels.level2.title,
    openHref: resourcePath(key, 1),
    printL1: resourcePrintPath(key, 1),
    printL2: resourcePrintPath(key, 2),
    editL1: resourceEditPath(key, 1),
    editL2: resourceEditPath(key, 2),
  };
}

export function packWeekAnchor(weekId: string): string {
  return `pack-${weekId}`;
}

export function packSheetAnchor(weekId: string): string {
  return `pack-${weekId}-sheet`;
}

export function packItemAnchor(weekId: string, slug: string, role: string): string {
  return `pack-${weekId}-${role}-${slug}`;
}

export function parsePackDownloadScope(raw: string | null | undefined): AdventPackDownloadScope | null {
  if (raw === "all") return "all";
  if (raw && [...ADVENT_PACK_WEEKS, ADVENT_PACK_BONUS].some((w) => w.id === raw)) {
    return raw as AdventPackDownloadScope;
  }
  return null;
}

/** Weeks included in a Download-all scope. */
export function weeksForPackScope(scope: AdventPackDownloadScope): AdventPackWeek[] {
  const all = [...ADVENT_PACK_WEEKS, ADVENT_PACK_BONUS];
  if (scope === "all") return all;
  return all.filter((w) => w.id === scope);
}

/** Unique activity slugs for ZIP (BW + colour each). */
export function packActivitySlugsForScope(scope: AdventPackDownloadScope): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const week of weeksForPackScope(scope)) {
    for (const item of week.items) {
      if (seen.has(item.slug)) continue;
      if (!getActivity(item.slug)) continue;
      seen.add(item.slug);
      slugs.push(item.slug);
    }
  }
  return slugs;
}

export function packSheetPrintUrlsForScope(scope: AdventPackDownloadScope): string[] {
  const urls: string[] = [];
  for (const week of weeksForPackScope(scope)) {
    const sheet = adventPackSheetLinks(week.sheetKey);
    if (!sheet) continue;
    urls.push(sheet.printL1, sheet.printL2);
  }
  return urls;
}

export function packDownloadPath(scope: AdventPackDownloadScope): string {
  return `${ADVENT_PACK_DOWNLOAD_PATH}?scope=${scope}`;
}

export type AdventPackItemView = AdventPackActivityRef & {
  activity: ResourceActivity;
  openHref: string;
  editHref: string | null;
};

export function resolvePackItem(ref: AdventPackActivityRef): AdventPackItemView | null {
  const activity = getActivity(ref.slug);
  if (!activity) return null;
  return {
    ...ref,
    activity,
    openHref: activityPath(activity.slug),
    editHref: activity.editable ? activityEditPath(activity.slug) : null,
  };
}

export function adventPackOutline(): Array<{
  week: AdventPackWeek;
  sheet: AdventPackSheetLinks | null;
  items: AdventPackItemView[];
}> {
  return [...ADVENT_PACK_WEEKS, ADVENT_PACK_BONUS].map((week) => ({
    week,
    sheet: adventPackSheetLinks(week.sheetKey),
    items: week.items.flatMap((ref) => {
      const item = resolvePackItem(ref);
      return item ? [item] : [];
    }),
  }));
}
