import type { PrayerLanguageCode } from "@/lib/prayers/prayer-languages";
import type { PrayerTranslationMap } from "@/lib/prayers/prayer-types";
import { DE_PRAYERS } from "@/lib/prayers/translations/de";
import { EN_PRAYERS } from "@/lib/prayers/translations/en";
import { ES_PRAYERS } from "@/lib/prayers/translations/es";
import { FR_PRAYERS } from "@/lib/prayers/translations/fr";
import { IT_PRAYERS } from "@/lib/prayers/translations/it";
import { KO_PRAYERS } from "@/lib/prayers/translations/ko";
import { PL_PRAYERS } from "@/lib/prayers/translations/pl";
import { PT_PRAYERS } from "@/lib/prayers/translations/pt";
import { TL_PRAYERS } from "@/lib/prayers/translations/tl";
import { VI_PRAYERS } from "@/lib/prayers/translations/vi";

export const PRAYER_TRANSLATIONS: Record<PrayerLanguageCode, PrayerTranslationMap> = {
  en: EN_PRAYERS,
  es: ES_PRAYERS,
  fr: FR_PRAYERS,
  ko: KO_PRAYERS,
  pt: PT_PRAYERS,
  it: IT_PRAYERS,
  de: DE_PRAYERS,
  pl: PL_PRAYERS,
  vi: VI_PRAYERS,
  tl: TL_PRAYERS,
};
