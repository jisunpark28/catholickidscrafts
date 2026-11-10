import { loadUniversalisMassTodayClient } from "@/lib/universalis-client";
import type { UniversalisMassDay } from "@/lib/universalis-parse";

/**
 * Load one day's Mass readings for the typing UI, from Universalis only, in the visitor's browser
 * (JSONP, as https://universalis.com/n-web.htm describes). The site's server never fetches Universalis,
 * and no USCCB text is used.
 *
 * Tries the dated URL first; if that fails and `dateKey` is today, retries the undated feed with a
 * per-day query string. Only a payload for exactly `dateKey` is accepted.
 */
export async function loadMassDayForTyping(
  dateKey: string,
  todayDateKey: string = dateKey,
): Promise<UniversalisMassDay> {
  if (typeof window === "undefined") throw new Error("Readings load in the browser.");
  let day: UniversalisMassDay | null = null;
  try {
    day = await loadUniversalisMassTodayClient(dateKey, "dated");
  } catch (error) {
    if (dateKey !== todayDateKey) throw error;
    day = await loadUniversalisMassTodayClient(dateKey, "fresh");
  }
  if (day.date !== dateKey) throw new Error("Readings for this day aren't available.");
  return day;
}
