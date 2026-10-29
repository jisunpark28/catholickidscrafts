// Little Light picture cards: the catalog (626 cards). Import from server code only —
// client components use ./card-meta so the JSON stays out of the browser bundle.
import CARDS_JSON from "@/data/cards/cards.json";
import { CARD_ID_RE, type CardListItem, type PictureCard } from "./card-meta";

export * from "./card-meta";

export const PICTURE_CARDS: readonly PictureCard[] = CARDS_JSON as PictureCard[];

const BY_ID = new Map(PICTURE_CARDS.map((c) => [c.id, c]));

export function getPictureCard(id: string | null | undefined): PictureCard | null {
  if (!id || !CARD_ID_RE.test(id)) return null;
  return BY_ID.get(id) ?? null;
}

const PREFIX_ORDER = ["FEA", "BIB", "LIT", "MAR", "SNT", "SAC", "MAS", "PRY", "VIR", "FUN", "MST"];

/** Cards tied to a Sunday sheet key, best first (Feast > Bible > Liturgical Year > …). */
export function cardsForSheetKey(sheetKey: string): PictureCard[] {
  return PICTURE_CARDS.filter((c) => c.sheetKeys?.includes(sheetKey)).sort(
    (a, b) =>
      PREFIX_ORDER.indexOf(a.id.slice(0, 3)) - PREFIX_ORDER.indexOf(b.id.slice(0, 3)) ||
      a.prio - b.prio ||
      a.id.localeCompare(b.id),
  );
}

/** Season card when no card names this Sunday directly. */
export function seasonCardForSheetKey(sheetKey: string): PictureCard | null {
  const k = sheetKey.toUpperCase();
  const id = /_ADV\d/.test(k)
    ? "LIT-002"
    : /_LNT\d/.test(k)
      ? "LIT-007"
      : /_EAS\d/.test(k)
        ? "LIT-013"
        : /_OT\d/.test(k)
          ? "LIT-006"
          : k === "XMAS2" || /CHRISTMAS|EPIPHANY|BAPTISM|HOLYFAMILY|MARYMOTHER/.test(k)
            ? "LIT-005"
            : null;
  return getPictureCard(id);
}

export function cardsForSunday(sheetKey: string): { primary: PictureCard | null; more: PictureCard[] } {
  const direct = cardsForSheetKey(sheetKey);
  if (direct.length) return { primary: direct[0]!, more: direct.slice(1) };
  return { primary: seasonCardForSheetKey(sheetKey), more: [] };
}

export function toCardListItem(card: PictureCard, date?: { date: string; sunday: boolean }): CardListItem {
  return {
    id: card.id,
    cat: card.cat,
    set: card.set,
    title: card.title,
    ...(card.ref ? { ref: card.ref } : {}),
    ...(card.when ? { when: card.when } : {}),
    ...(date ? { date: date.date, sunday: date.sunday } : {}),
  };
}
