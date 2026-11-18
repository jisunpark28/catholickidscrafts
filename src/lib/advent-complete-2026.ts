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
import { resourcePrintPath } from "@/lib/resource/sheets";
import { getSundaySheet } from "@/lib/sunday-sheet-content";

export const ADVENT_PACK_PATH = "/advent-complete-2026";
export const ADVENT_PACK_DATES = "Nov 29 – Dec 20, 2026";

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
    printL1: resourcePrintPath(key, 1),
    printL2: resourcePrintPath(key, 2),
    editL1: resourceEditPath(key, 1),
    editL2: resourceEditPath(key, 2),
  };
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
