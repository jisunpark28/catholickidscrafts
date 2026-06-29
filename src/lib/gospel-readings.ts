import { parseDateParam, todayUniversalis, toDateKey } from "@/lib/dates";
import { isAcceptableUniversalisDate } from "@/lib/universalis-date-match";
import type { UniversalisMassDay } from "@/lib/universalis-parse";
import { fetchMassDayForTyping } from "@/lib/universalis";
import {
  fetchUsccbReadingsForDate,
  MASS_READINGS_PRIMARY_SOURCE,
  USCCB_COPYRIGHT_NOTICE,
  usccbReadingsPageUrl,
} from "@/lib/usccb-rss";

function usccbToMassDay(
  usccb: NonNullable<Awaited<ReturnType<typeof fetchUsccbReadingsForDate>>>,
): UniversalisMassDay {
  return {
    date: usccb.dateKey,
    liturgicalTitle: usccb.liturgicalTitle,
    readings: usccb.readings.map((r) => ({
      ...r,
      externalUrl: usccb.pageUrl,
    })),
    source: MASS_READINGS_PRIMARY_SOURCE,
    pageUrl: usccb.pageUrl,
    copyrightNotice: USCCB_COPYRIGHT_NOTICE,
  };
}

/**
 * Gospel hub readings for a calendar date.
 * Today: Universalis JSONP. Past dates: USCCB Daily Readings RSS when available.
 */
export async function fetchGospelReadingsForDate(
  date: Date,
): Promise<UniversalisMassDay> {
  const dateKey = toDateKey(date);
  const todayKey = toDateKey(todayUniversalis());

  if (dateKey > todayKey) {
    throw new Error("Future dates are not available.");
  }

  if (dateKey === todayKey) {
    try {
      const day = await fetchMassDayForTyping();
      if (isAcceptableUniversalisDate(day.date, todayKey)) {
        return day;
      }
    } catch {
      // Fall through to USCCB for today if Universalis is unreachable.
    }
  }

  const usccb = await fetchUsccbReadingsForDate(date);
  if (!usccb || usccb.readings.length === 0) {
    throw new Error(
      dateKey === todayKey
        ? "Could not load today's readings. Try again in a few minutes."
        : `Readings for ${dateKey} are not in the USCCB feed. Open the official USCCB page for this date.`,
    );
  }

  const mapped = usccbToMassDay(usccb);
  if (mapped.date !== dateKey) {
    throw new Error(`USCCB feed returned ${mapped.date}; expected ${dateKey}.`);
  }
  return mapped;
}

export function gospelReadingsOutboundUrl(date: Date): string {
  return usccbReadingsPageUrl(date);
}

export function parseGospelDateParam(input: string): Date | null {
  return parseDateParam(input);
}
