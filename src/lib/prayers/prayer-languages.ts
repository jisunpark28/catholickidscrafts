/** Top 10 languages for Catholic parish use (en, es, fr, ko required). */
export const PRAYER_LANGUAGE_CODES = [
  "en",
  "es",
  "fr",
  "ko",
  "pt",
  "it",
  "de",
  "pl",
  "vi",
  "tl",
] as const;

export type PrayerLanguageCode = (typeof PRAYER_LANGUAGE_CODES)[number];

export const DEFAULT_PRAYER_LANGUAGE: PrayerLanguageCode = "en";

export type PrayerLanguageOption = {
  code: PrayerLanguageCode;
  label: string;
  nativeName: string;
};

export const PRAYER_LANGUAGES: PrayerLanguageOption[] = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "fr", label: "French", nativeName: "Français" },
  { code: "ko", label: "Korean", nativeName: "한국어" },
  { code: "pt", label: "Portuguese", nativeName: "Português" },
  { code: "it", label: "Italian", nativeName: "Italiano" },
  { code: "de", label: "German", nativeName: "Deutsch" },
  { code: "pl", label: "Polish", nativeName: "Polski" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "tl", label: "Tagalog", nativeName: "Tagalog" },
];

export function isPrayerLanguageCode(value: string): value is PrayerLanguageCode {
  return (PRAYER_LANGUAGE_CODES as readonly string[]).includes(value);
}

export function normalizePrayerLanguage(value: string | null | undefined): PrayerLanguageCode {
  const raw = value?.trim().toLowerCase() ?? "";
  return isPrayerLanguageCode(raw) ? raw : DEFAULT_PRAYER_LANGUAGE;
}
