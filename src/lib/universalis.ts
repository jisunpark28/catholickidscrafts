import { todayUniversalis, toDateKey } from "@/lib/dates";
import {
  massDayFromUniversalisPayload,
  parseUniversalisJsonpBody,
  UNIVERSALIS_ORIGIN,
  type UniversalisMassDay,
} from "@/lib/universalis-parse";

export {
  UNIVERSALIS_READINGS_SOURCE,
  type UniversalisMassDay,
} from "@/lib/universalis-parse";

/** Calendar path segment, e.g. `Europe.England` for ICEL / ESV-CE on Universalis. */
export function universalisCalendarPath(): string {
  const fromEnv = process.env.UNIVERSALIS_CALENDAR_PATH?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : "Europe.England";
}

export function universalisMassPageUrl(calendarPath = universalisCalendarPath()): string {
  return `${UNIVERSALIS_ORIGIN}/${calendarPath}/mass.htm`;
}

export function universalisJsonpUrl(calendarPath = universalisCalendarPath()): string {
  return `${UNIVERSALIS_ORIGIN}/${calendarPath}/jsonpmass.js`;
}

/** JSONP endpoint always returns Universalis “today” for the configured calendar. */
export async function fetchUniversalisMassToday(): Promise<UniversalisMassDay> {
  const calendarPath = universalisCalendarPath();
  const url = universalisJsonpUrl(calendarPath);

  const response = await fetch(url, {
    next: { revalidate: 3600 },
    headers: {
      Accept: "*/*",
      "User-Agent":
        "CatholicKidsCrafts/1.0 (typing practice; +https://www.catholickidscrafts.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Universalis HTTP ${response.status}`);
  }

  const body = await response.text();
  const payload = parseUniversalisJsonpBody(body);
  return massDayFromUniversalisPayload(payload, calendarPath);
}

/** @deprecated Use fetchUniversalisMassToday — JSONP has no per-date parameter. */
export async function fetchUniversalisMassDay(date: Date): Promise<UniversalisMassDay> {
  const day = await fetchUniversalisMassToday();
  const requestedKey = toDateKey(date);
  const universalisKey = toDateKey(todayUniversalis());
  if (requestedKey !== day.date && requestedKey !== universalisKey) {
    throw new Error(
      `Only today's readings are available (Universalis: ${day.date}).`,
    );
  }
  return day;
}

/** Today's readings for typing — Universalis JSONP only (see universalis.com/n-web.htm). */
export async function fetchMassDayForTyping(): Promise<UniversalisMassDay> {
  return fetchUniversalisMassToday();
}
