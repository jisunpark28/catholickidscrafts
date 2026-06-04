import { parseDateParam, toDateKey } from "@/lib/dates";
import { usccbReadingsPageUrl } from "@/lib/usccb-rss";

const LWC_READINGS_BASE = "https://readings.livingwithchrist.ca";

/** Canadian daily Mass readings (Living with Christ / Bayard). */
export function livingWithChristReadingUrl(date: Date | string): string {
  const key = typeof date === "string" ? date : toDateKey(date);
  return `${LWC_READINGS_BASE}/daily-texts/reading/${key}`;
}

export function livingWithChristHomeUrl(): string {
  return `${LWC_READINGS_BASE}/`;
}

export type ScriptureSiteLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  /** When set, `hrefForDate` is used on mass/typing pages that pass a date. */
  dated?: "lwc-reading" | "usccb-readings";
};

/** Official or publisher-hosted Catholic Scripture & Mass reading sites. */
export const RECOMMENDED_SCRIPTURE_SITES: ScriptureSiteLink[] = [
  {
    id: "lwc",
    label: "Living with Christ",
    description: "Canada — daily Mass readings (CCCB lectionary, NRSV)",
    href: livingWithChristHomeUrl(),
    dated: "lwc-reading",
  },
  {
    id: "lwc-home",
    label: "Living with Christ (main site)",
    description: "Canada — missalette & daily citations",
    href: "https://livingwithchrist.ca/",
  },
  {
    id: "usccb-readings",
    label: "USCCB Daily Readings",
    description: "United States — official daily Mass texts",
    href: "https://bible.usccb.org/bible/readings/",
    dated: "usccb-readings",
  },
  {
    id: "usccb-bible",
    label: "USCCB Bible (NABRE)",
    description: "United States — New American Bible, Revised Edition",
    href: "https://bible.usccb.org/",
  },
  {
    id: "vatican-bible",
    label: "Holy See — Bible",
    description: "Vatican — English Bible archive (Holy See)",
    href: "https://www.vatican.va/archive/ENG0015/_INDEX.HTM",
  },
];

export function scriptureSiteHrefForDate(
  site: ScriptureSiteLink,
  dateKey: string,
): string {
  if (!site.dated) return site.href;
  const date = parseDateParam(dateKey);
  if (!date) return site.href;
  if (site.dated === "lwc-reading") return livingWithChristReadingUrl(dateKey);
  if (site.dated === "usccb-readings") return usccbReadingsPageUrl(date);
  return site.href;
}
