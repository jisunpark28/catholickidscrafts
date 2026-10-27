import { formatSunday } from "@/lib/weekly-content";
import {
  COUNTRY_COOKIE,
  pickCountry,
  thisSunday,
} from "@/lib/resource/this-sunday";
import { keyToSlug } from "@/lib/resource/sheets";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import { loadFeaturedSheet } from "@/lib/gospel-sheet";
import { cookies, headers } from "next/headers";

export type HomeSundaySheet = {
  /** Path segment used in print URLs (resource slug or DB date slug). */
  slug: string;
  title: string;
  liturgicalName: string;
  sundayLabel: string;
  gospelRef: string;
  /** e.g. `/print/resource/a-ot30` or `/print/2026-10-25` */
  printBasePath: string;
  /** Sheet-key when from the static catalog (for analytics / debugging). */
  key?: string;
};

/**
 * Homepage Sunday Sheet slide: always prefer **this Sunday** from the
 * liturgical calendar + static 188-key catalog. Falls back to the admin
 * featured GospelSheet row if romcal/catalog miss.
 */
export async function loadHomeSundaySheet(): Promise<HomeSundaySheet | null> {
  try {
    const [cookieStore, h] = await Promise.all([cookies(), headers()]);
    const country = pickCountry(
      undefined,
      cookieStore.get(COUNTRY_COOKIE)?.value,
      h.get("x-vercel-ip-country"),
    );
    const sunday = thisSunday(country);
    if (sunday) {
      const sheet = getSundaySheet(sunday.key);
      if (sheet) {
        const slug = keyToSlug(sheet.key);
        return {
          slug,
          key: sheet.key,
          title: sheet.levels.level1.title || sheet.liturgicalName,
          liturgicalName: sheet.liturgicalName,
          sundayLabel: formatSunday(new Date(`${sunday.date}T00:00:00Z`)),
          gospelRef: sheet.gospelRef,
          printBasePath: `/print/resource/${slug}`,
        };
      }
      console.warn("[home-sunday-sheet] no catalog sheet for", sunday.key, sunday.date);
    }
  } catch (e) {
    console.error("[home-sunday-sheet] calendar lookup failed", e);
  }

  const featured = await loadFeaturedSheet();
  if (!featured) return null;
  return {
    slug: featured.slug,
    title: featured.levels.level1.title || featured.liturgicalName,
    liturgicalName: featured.liturgicalName,
    sundayLabel: featured.sundayLabel,
    gospelRef: featured.gospelRef,
    printBasePath: `/print/${featured.slug}`,
  };
}
