import { toDateKey } from "@/lib/dates";

const LWC_READINGS_BASE = "https://readings.livingwithchrist.ca";

/** Daily Mass readings (Living with Christ / Bayard). */
export function livingWithChristReadingUrl(date: Date | string): string {
  const key = typeof date === "string" ? date : toDateKey(date);
  return `${LWC_READINGS_BASE}/daily-texts/reading/${key}`;
}

export function livingWithChristHomeUrl(): string {
  return `${LWC_READINGS_BASE}/`;
}
