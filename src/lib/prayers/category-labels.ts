import type { PrayerCategoryId } from "@/lib/prayers/prayer-catalog";
import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";

const LABELS: Record<PrayerLanguageCode, Record<PrayerCategoryId, string>> = {
  en: {
    essential: "Essential prayers",
    creeds: "Creeds",
    daily: "Daily & meal prayers",
    sacramental: "Sacramental prayers",
    devotional: "Devotional prayers",
  },
  es: {
    essential: "Oraciones esenciales",
    creeds: "Credo",
    daily: "Oraciones diarias y de mesa",
    sacramental: "Oraciones sacramentales",
    devotional: "Oraciones devocionales",
  },
  fr: {
    essential: "Prières essentielles",
    creeds: "Credo",
    daily: "Prières quotidiennes et de repas",
    sacramental: "Prières sacramentelles",
    devotional: "Prières dévotionnelles",
  },
  ko: {
    essential: "기본 기도",
    creeds: "신경",
    daily: "일과·식사 기도",
    sacramental: "성사 기도",
    devotional: "전구 기도",
  },
  pt: {
    essential: "Orações essenciais",
    creeds: "Credo",
    daily: "Orações diárias e das refeições",
    sacramental: "Orações sacramentais",
    devotional: "Orações devocionais",
  },
  it: {
    essential: "Preghiere essenziali",
    creeds: "Credo",
    daily: "Preghiere quotidiane e dei pasti",
    sacramental: "Preghiere sacramentali",
    devotional: "Preghiere devozionali",
  },
  de: {
    essential: "Grundgebete",
    creeds: "Glaubensbekenntnisse",
    daily: "Tages- und Tischgebete",
    sacramental: "Sakramentale Gebete",
    devotional: "Andachtsgebete",
  },
  pl: {
    essential: "Podstawowe modlitwy",
    creeds: "Wyznania wiary",
    daily: "Modlitwy codzienne i posiłków",
    sacramental: "Modlitwy sakramentalne",
    devotional: "Modlitwy dewocyjne",
  },
  vi: {
    essential: "Kinh nguyện thiết yếu",
    creeds: "Tín ngưỡng",
    daily: "Kinh nguyện hằng ngày và bữa ăn",
    sacramental: "Kinh nguyện bí tích",
    devotional: "Kinh nguyện sùng kính",
  },
  tl: {
    essential: "Mahahalagang panalangin",
    creeds: "Mga pananalig",
    daily: "Pang-araw-araw at panalangin sa pagkain",
    sacramental: "Sakramental na panalangin",
    devotional: "Debosyonal na panalangin",
  },
};

export function prayerCategoryLabel(
  categoryId: PrayerCategoryId,
  lang: PrayerLanguageCode,
): string {
  return LABELS[lang][categoryId] ?? LABELS.en[categoryId];
}

export function sortedPrayerCategoryIds(): PrayerCategoryId[] {
  return ["essential", "creeds", "daily", "sacramental", "devotional"];
}
