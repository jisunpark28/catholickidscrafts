import { loadUniversalisMassTodayClient } from "@/lib/universalis-client";
import { parseDateParam } from "@/lib/dates";
import type { UniversalisMassDay } from "@/lib/universalis-parse";

/** Site “today” may be up to one civil day ahead of Universalis during GMT/BST rollover. */
function isAcceptableUniversalisDate(
  universalisDateKey: string,
  siteTodayKey: string,
): boolean {
  if (universalisDateKey === siteTodayKey) return true;
  const site = parseDateParam(siteTodayKey);
  const uni = parseDateParam(universalisDateKey);
  if (!site || !uni) return false;
  const diffDays = (site.getTime() - uni.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}

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
    if (!isAcceptableUniversalisDate(clientDay.date, todayDateKey)) {
      throw new Error(
        `Readings are for ${clientDay.date}. Select today (${todayDateKey}) on your calendar.`,
      );
    }
    return clientDay;
  }
}
