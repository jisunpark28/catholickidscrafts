import { FAMILY_TALK } from "@/lib/daily-mass/family-talk";

/** Days of warning before the Faith Journal questions run out. */
export const FAMILY_TALK_WARN_DAYS = 14;

export type FamilyTalkCoverage = {
  /** Last date (YYYY-MM-DD) that has questions, or null when the list is empty. */
  lastDate: string | null;
  /** Today's date in America/Toronto (YYYY-MM-DD). */
  today: string;
  /** Whole days from today until the last covered date (negative once it has passed). */
  daysLeft: number | null;
  /** True when daysLeft is FAMILY_TALK_WARN_DAYS or fewer. */
  warn: boolean;
};

function torontoDateKey(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y!, m! - 1, d!) / 86_400_000);
}

export function familyTalkCoverage(now: Date = new Date()): FamilyTalkCoverage {
  const keys = Object.keys(FAMILY_TALK).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
  const lastDate = keys.at(-1) ?? null;
  const today = torontoDateKey(now);
  const daysLeft = lastDate ? dayNumber(lastDate) - dayNumber(today) : null;
  return { lastDate, today, daysLeft, warn: daysLeft === null || daysLeft <= FAMILY_TALK_WARN_DAYS };
}

/** "Sat, Nov 28, 2026" for a YYYY-MM-DD key. */
export function formatDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(y!, m! - 1, d!)));
}

/** The day after a YYYY-MM-DD key, as YYYY-MM-DD. */
export function nextDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + 1)).toISOString().slice(0, 10);
}

/**
 * Sunday Lectionary cycle (A = Matthew, B = Mark, C = Luke) for the liturgical
 * year that begins at Advent in the calendar year of `adventDateKey`.
 * The year beginning Advent 2025 is A, Advent 2026 is B, Advent 2027 is C.
 */
export function sundayCycleFor(adventDateKey: string): "A" | "B" | "C" {
  const y = Number(adventDateKey.slice(0, 4));
  return (["A", "B", "C"] as const)[y % 3]!;
}
