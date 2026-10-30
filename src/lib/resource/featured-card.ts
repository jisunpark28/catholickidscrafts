// Server-only: the picture card featured on the ★ This Sunday tab, picked fresh on every request.
// The same function decides which card is free to download (download API) and which card the
// free bundle print shows, so the page and the gate always agree.
import type { RomcalCountry } from "@/lib/sheet-keys";
import { cardsForSheetKey, cardsForSunday, PICTURE_CARDS } from "@/lib/resource/cards";
import type { PictureCard } from "@/lib/resource/card-meta";
import { thisSunday, todayIn } from "@/lib/resource/this-sunday";

export type FeaturedCardReason = "today" | "sunday" | "season";

export type FeaturedCard = {
  card: PictureCard;
  reason: FeaturedCardReason;
  /** Local date (YYYY-MM-DD) the choice was made for. */
  today: string;
  /** Upcoming Sunday (today if Sunday) and its sheet key. */
  sundayDate: string;
  sundayKey: string;
};

const PREFIX_ORDER = ["FEA", "MAR", "SNT", "LIT", "BIB", "SAC", "MAS", "PRY", "VIR", "FUN", "MST"];

/** Fixed-date cards (feast, saint, memorial) for an MM-DD, best first (Feast > Mary > Saint > …). */
export function cardsForMonthDay(md: string): PictureCard[] {
  return PICTURE_CARDS.filter((c) => c.md === md).sort(
    (a, b) =>
      PREFIX_ORDER.indexOf(a.id.slice(0, 3)) - PREFIX_ORDER.indexOf(b.id.slice(0, 3)) ||
      a.prio - b.prio ||
      a.id.localeCompare(b.id),
  );
}

/**
 * Pick today's card in the viewer's local date (country time zone; America/Toronto for Canada):
 *  1. Weekdays: today's fixed-date feast/saint/memorial card (e.g. Nov 2 All Souls, Dec 8, Dec 25).
 *     Sundays: the Sunday's own card comes first (Sunday outranks memorials), then today's date card.
 *  2. Otherwise the upcoming Sunday's card (a card that names that Sunday's sheet).
 *  3. Otherwise the season card for that Sunday (Advent, Lent, Easter, Ordinary Time, Christmas).
 */
export function featuredCardFor(country: RomcalCountry, now = new Date()): FeaturedCard | null {
  const sunday = thisSunday(country, now);
  if (!sunday) return null;
  const today = todayIn(country, now);
  const md = today.slice(5);
  const isSunday = today === sunday.date;
  const dated = cardsForMonthDay(md)[0] ?? null;
  const sundayDirect = cardsForSheetKey(sunday.key)[0] ?? null;
  const base = { today, sundayDate: sunday.date, sundayKey: sunday.key };

  if (isSunday && sundayDirect) return { card: sundayDirect, reason: "sunday", ...base };
  if (dated) return { card: dated, reason: "today", ...base };
  if (sundayDirect) return { card: sundayDirect, reason: "sunday", ...base };
  const season = cardsForSunday(sunday.key).primary;
  return season ? { card: season, reason: "season", ...base } : null;
}

/** Cards a viewer without Plus may download right now: only the featured card. */
export function isFreeFeaturedCard(cardId: string, country: RomcalCountry, now = new Date()): boolean {
  return featuredCardFor(country, now)?.card.id === cardId;
}
