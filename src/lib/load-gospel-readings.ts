import { loadUniversalisMassTodayClient } from "@/lib/universalis-client";
import { isAcceptableUniversalisDate } from "@/lib/universalis-date-match";
import type { UniversalisMassDay } from "@/lib/universalis-parse";

/**
 * Load Mass readings for the gospel calendar date.
 * Server: GET /api/gospel/readings/[date] (today = Universalis, past = USCCB RSS).
 * Client fallback for today only: Universalis JSONP in the browser.
 */
export async function loadGospelReadingsForDate(
  dateKey: string,
  todayDateKey: string,
): Promise<UniversalisMassDay> {
  let apiError = "Could not load readings";

  try {
    const res = await fetch(`/api/gospel/readings/${dateKey}`);
    const text = await res.text();
    let data: UniversalisMassDay & { error?: string };
    try {
      data = text ? (JSON.parse(text) as typeof data) : ({} as typeof data);
    } catch {
      throw new Error("Could not load readings");
    }
    if (!res.ok) {
      apiError = data.error ?? apiError;
      throw new Error(apiError);
    }
    return data;
  } catch {
    if (typeof window === "undefined" || dateKey !== todayDateKey) {
      throw new Error(apiError);
    }
    const clientDay = await loadUniversalisMassTodayClient();
    if (!isAcceptableUniversalisDate(clientDay.date, todayDateKey)) {
      throw new Error(
        `Readings are for ${clientDay.date}. Select today (${todayDateKey}) on your calendar.`,
      );
    }
    return clientDay;
  }
}
