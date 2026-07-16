import { prayerCategoryLabel, sortedPrayerCategoryIds } from "@/lib/prayers/category-labels";
import { PRAYER_CATALOG } from "@/lib/prayers/prayer-catalog";
import {
  DEFAULT_PRAYER_LANGUAGE,
  type PrayerLanguageCode,
} from "@/lib/prayers/prayer-languages";
import type { LocalizedPrayer, PrayerTranslation } from "@/lib/prayers/prayer-types";
import { PRAYER_TRANSLATIONS } from "@/lib/prayers/translations";

export function getPrayerTranslation(
  slug: string,
  lang: PrayerLanguageCode,
): PrayerTranslation | undefined {
  const map = PRAYER_TRANSLATIONS[lang];
  const direct = map[slug];
  if (direct) return direct;

  if (lang !== DEFAULT_PRAYER_LANGUAGE) {
    return PRAYER_TRANSLATIONS[DEFAULT_PRAYER_LANGUAGE][slug];
  }

  return undefined;
}

export function getLocalizedPrayer(
  slug: string,
  lang: PrayerLanguageCode = DEFAULT_PRAYER_LANGUAGE,
): LocalizedPrayer | undefined {
  const catalog = PRAYER_CATALOG.find((p) => p.slug === slug);
  if (!catalog) return undefined;

  const translation = getPrayerTranslation(slug, lang);
  if (!translation) return undefined;

  return { ...catalog, ...translation };
}

export function getDefaultLocalizedPrayer(
  lang: PrayerLanguageCode = DEFAULT_PRAYER_LANGUAGE,
): LocalizedPrayer {
  const first = PRAYER_CATALOG[0]!;
  return getLocalizedPrayer(first.slug, lang) ?? {
    ...first,
    title: "Prayer",
    text: "",
  };
}

export function localizedPrayersByCategory(
  categoryId: string,
  lang: PrayerLanguageCode,
): LocalizedPrayer[] {
  return PRAYER_CATALOG.filter((p) => p.categoryId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => getLocalizedPrayer(p.slug, lang))
    .filter((p): p is LocalizedPrayer => Boolean(p));
}

export function allLocalizedPrayers(lang: PrayerLanguageCode): LocalizedPrayer[] {
  return PRAYER_CATALOG.map((p) => getLocalizedPrayer(p.slug, lang)).filter(
    (p): p is LocalizedPrayer => Boolean(p),
  );
}

export function sortedLocalizedCategoryIds(lang: PrayerLanguageCode) {
  return sortedPrayerCategoryIds().map((id) => ({
    id,
    label: prayerCategoryLabel(id, lang),
  }));
}

/** Flat list for search indexing across languages. */
export function allPrayerSearchEntries(): {
  slug: string;
  lang: PrayerLanguageCode;
  title: string;
  subtitle: string;
  excerpt: string;
}[] {
  const out: {
    slug: string;
    lang: PrayerLanguageCode;
    title: string;
    subtitle: string;
    excerpt: string;
  }[] = [];

  for (const lang of Object.keys(PRAYER_TRANSLATIONS) as PrayerLanguageCode[]) {
    for (const entry of PRAYER_CATALOG) {
      const t = getPrayerTranslation(entry.slug, lang);
      if (!t) continue;
      out.push({
        slug: entry.slug,
        lang,
        title: t.title,
        subtitle: t.subtitle ?? "",
        excerpt: t.text.slice(0, 140),
      });
    }
  }

  return out;
}
