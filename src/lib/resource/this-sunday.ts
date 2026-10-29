// Server-only (romcal via sheet-keys). "This Sunday" for a country.
import { COUNTRY_CONFIG, ENABLED_COUNTRIES, resolveCountry, toSheetKey, type RomcalCountry } from "@/lib/sheet-keys";

export const COUNTRY_COOKIE = "ckc_country";

export const COUNTRY_LABELS: Partial<Record<RomcalCountry, string>> = {
  canada: "🇨🇦 Canada",
  unitedStates: "🇺🇸 United States",
  general: "🌐 Other countries",
};

/** Selector options: enabled countries, then the General Roman Calendar fallback. */
export function countryOptions(): { value: RomcalCountry; label: string }[] {
  return [...ENABLED_COUNTRIES, "general" as const].map((c) => ({ value: c, label: COUNTRY_LABELS[c] ?? c }));
}

/** URL choice > cookie > Vercel IP header; anything not enabled becomes `general`. */
export function pickCountry(
  param: string | undefined,
  cookie: string | undefined,
  ipHeader: string | null,
): RomcalCountry {
  if (param && Object.prototype.hasOwnProperty.call(COUNTRY_CONFIG, param)) return resolveCountry(null, param);
  return resolveCountry(ipHeader, cookie);
}

const ZONE: Partial<Record<RomcalCountry, string>> = { canada: "America/Toronto", unitedStates: "America/New_York" };

/** Today's calendar date in the country's main time zone, as YYYY-MM-DD. */
export function todayIn(country: RomcalCountry, now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE[country] ?? "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The coming Sunday (today if Sunday) and its sheet key. Null if romcal fails. */
export function thisSunday(country: RomcalCountry, now = new Date()): { date: string; key: string } | null {
  const today = todayIn(country, now);
  const t = Date.parse(`${today}T00:00:00Z`);
  const dow = new Date(t).getUTCDay();
  const date = new Date(t + ((7 - dow) % 7) * 86_400_000).toISOString().slice(0, 10);
  try {
    return { date, key: toSheetKey(date, country) };
  } catch (e) {
    console.error("[resource] toSheetKey failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export function formatSundayDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
