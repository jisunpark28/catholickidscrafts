export type PrayerTranslation = {
  title: string;
  subtitle?: string;
  text: string;
};

export type PrayerCatalogEntry = {
  slug: string;
  categoryId: string;
  sortOrder: number;
};

export type LocalizedPrayer = PrayerCatalogEntry & PrayerTranslation;

export type PrayerTranslationMap = Record<string, PrayerTranslation>;
