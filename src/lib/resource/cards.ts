// Little Light picture cards: the catalog (626 cards). Import from server code only —
// client components use ./card-meta so the JSON stays out of the browser bundle.
import CARDS_JSON from "@/data/cards/cards.json";
import { getSundaySheet } from "@/lib/sunday-sheet-content";
import { CARD_ID_RE, type CardListItem, type CardSeason, type PictureCard } from "./card-meta";
import { sheetSeason } from "./sheets";

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

const WHEN_SEASONS: [RegExp, CardSeason][] = [
  [/advent/i, "advent"],
  [/christmas|epiphany|baptism of the lord|holy family/i, "christmas"],
  [/lent|holy week|holy thursday|good friday|ash wednesday|palm sunday|before easter|chrism/i, "lent"],
  [/easter|pentecost|ascension/i, "easter"],
  [/ordinary time|green season/i, "ordinary-time"],
];

/**
 * Liturgical seasons a card belongs to, from real data only: its Sunday sheets' seasons,
 * season words in its "when" label, fixed Advent/Christmas dates, and feast days.
 * Cards for "anytime" get none (they show under Season: All).
 */
export function cardSeasons(card: PictureCard): CardSeason[] {
  const out = new Set<CardSeason>();
  for (const k of card.sheetKeys ?? []) {
    const sheet = getSundaySheet(k);
    if (sheet) out.add(sheetSeason(sheet));
  }
  const when = card.when ?? "";
  if (!/^anytime\b/i.test(when) || /lent|easter|advent|christmas/i.test(when)) {
    for (const [re, s] of WHEN_SEASONS) {
      // "Advent & Lent", "Sundays outside Advent & Lent" etc.: skip negated mentions.
      if (re.test(when) && !/outside|not in/i.test(when)) out.add(s);
    }
  }
  if (card.md) {
    if (card.md >= "12-01" && card.md <= "12-24") out.add("advent");
    else if (card.md >= "12-25" || card.md <= "01-13") out.add("christmas");
    else out.add("feasts");
  }
  if (card.cat === "Feast" && !out.size) out.add("feasts");
  return [...out];
}

export function toCardListItem(card: PictureCard, date?: { date: string; sunday: boolean }): CardListItem {
  const seasons = cardSeasons(card);
  return {
    id: card.id,
    cat: card.cat,
    set: card.set,
    title: card.title,
    ...(card.ref ? { ref: card.ref } : {}),
    ...(card.when ? { when: card.when } : {}),
    ...(date ? { date: date.date, sunday: date.sunday } : {}),
    ...(seasons.length ? { seasons } : {}),
  };
}
