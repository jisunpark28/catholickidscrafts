// Server-only (romcal via sheet-keys): next date each picture card is used.
import { toSheetKey, type RomcalCountry } from "@/lib/sheet-keys";
import { PICTURE_CARDS } from "@/lib/resource/cards";

const DAY = 86_400_000;

/**
 * Card id -> next date (YYYY-MM-DD) within the coming year, from `today` (YYYY-MM-DD) on.
 * Sunday-sheet cards use the Sunday whose sheet key matches; fixed-day cards (e.g. "Nov 1")
 * use their next calendar occurrence. Cards with neither are left out.
 */
export function upcomingCardDates(
  today: string,
  sundayDate: string,
  country: RomcalCountry,
): Record<string, { date: string; sunday: boolean }> {
  const out: Record<string, { date: string; sunday: boolean }> = {};
  const start = Date.parse(`${sundayDate}T00:00:00Z`);
  if (!Number.isFinite(start)) return out;

  // Sunday sheet keys for the next 53 Sundays (romcal calendars are cached per year).
  const keyDate = new Map<string, string>();
  for (let i = 0; i < 53; i++) {
    const day = new Date(start + i * 7 * DAY).toISOString().slice(0, 10);
    try {
      const key = toSheetKey(day, country);
      if (!keyDate.has(key)) keyDate.set(key, day);
    } catch {
      /* romcal gap: skip this Sunday */
    }
  }

  const from = Date.parse(`${today}T00:00:00Z`);
  const weekStart = Number.isFinite(from) ? from : start;
  const y = new Date(weekStart).getUTCFullYear();
  for (const card of PICTURE_CARDS) {
    let best: { date: string; sunday: boolean } | null = null;
    for (const k of card.sheetKeys ?? []) {
      const d = keyDate.get(k);
      if (d && (!best || d < best.date)) best = { date: d, sunday: true };
    }
    if (card.md) {
      for (const year of [y, y + 1]) {
        const t = Date.parse(`${year}-${card.md}T00:00:00Z`);
        if (Number.isFinite(t) && t >= weekStart) {
          const d = new Date(t).toISOString().slice(0, 10);
          if (!best || d < best.date) best = { date: d, sunday: new Date(t).getUTCDay() === 0 };
          break;
        }
      }
    }
    if (best) out[card.id] = best;
  }
  return out;
}
