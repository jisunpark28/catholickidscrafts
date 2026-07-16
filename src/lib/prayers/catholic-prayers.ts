/**
 * Backwards-compatible exports. Prefer resolve-prayer + prayer-languages for i18n.
 */
import { PRAYER_CATALOG } from "@/lib/prayers/prayer-catalog";
import { DEFAULT_PRAYER_LANGUAGE } from "@/lib/prayers/prayer-languages";
import type { LocalizedPrayer } from "@/lib/prayers/prayer-types";
import {
  allLocalizedPrayers,
  getDefaultLocalizedPrayer,
  getLocalizedPrayer,
  localizedPrayersByCategory,
} from "@/lib/prayers/resolve-prayer";

export type CatholicPrayer = LocalizedPrayer;

export const CATHOLIC_PRAYERS: CatholicPrayer[] = allLocalizedPrayers(
  DEFAULT_PRAYER_LANGUAGE,
);

export function getPrayerBySlug(slug: string): CatholicPrayer | undefined {
  return getLocalizedPrayer(slug, DEFAULT_PRAYER_LANGUAGE);
}

export function getDefaultPrayer(): CatholicPrayer {
  return getDefaultLocalizedPrayer(DEFAULT_PRAYER_LANGUAGE);
}

export function prayersByCategory(categoryId: string): CatholicPrayer[] {
  return localizedPrayersByCategory(categoryId, DEFAULT_PRAYER_LANGUAGE);
}

export function sortedPrayerCategories() {
  return [
    { id: "essential", label: "Essential prayers", sortOrder: 0 },
    { id: "creeds", label: "Creeds", sortOrder: 1 },
    { id: "daily", label: "Daily & meal prayers", sortOrder: 2 },
    { id: "sacramental", label: "Sacramental prayers", sortOrder: 3 },
    { id: "devotional", label: "Devotional prayers", sortOrder: 4 },
  ];
}

export { PRAYER_CATALOG };
