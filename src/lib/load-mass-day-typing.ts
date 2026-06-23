import { loadUniversalisMassTodayClient } from "@/lib/universalis-client";
import type { UniversalisMassDay } from "@/lib/universalis-parse";

/**
 * Load today's Mass readings for typing UI.
 * 1. Site API (server-side Universalis JSONP)
 * 2. Browser JSONP fallback (user's device → universalis.com)
 *
 * Does not use USCCB RSS — on-site text stays under Universalis webmaster terms only.
 */
export async function loadMassDayForTyping(
  todayDateKey: string,
): Promise<UniversalisMassDay> {
  let apiError = "Could not load readings";

  try {
    const res = await fetch(`/api/universalis-readings/${todayDateKey}`);
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
    if (typeof window === "undefined") {
      throw new Error(apiError);
    }
    const clientDay = await loadUniversalisMassTodayClient();
    if (clientDay.date !== todayDateKey) {
      throw new Error(
        `Readings are for ${clientDay.date}. Select today (${todayDateKey}) on your calendar.`,
      );
    }
    return clientDay;
  }
}
