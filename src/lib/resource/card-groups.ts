// Resource Cards browse groups (?group=<id>). Client-safe and data-free: the server
// computes each card's groups from its seasons (cardSeasons in ./cards) and sends ids only.
import type { CardSeason, PictureCard } from "./card-meta";

export type CardGroupId =
  | "saints-for-kids"
  | "mary-for-kids"
  | "advent-for-kids"
  | "christmas-for-kids"
  | "lent-for-kids"
  | "easter-for-kids"
  | "virtue-for-kids"
  | "prayer-for-kids"
  | "bible-for-kids"
  | "mass-for-kids"
  | "sacraments-for-kids"
  | "church-year-for-kids"
  | "fun-for-kids"
  | "sacred-art-for-kids";

export type CardGroup = {
  id: CardGroupId;
  /** Gallery heading, e.g. "Advent cards". */
  label: string;
  /** Fixed "Try this" suggestion text in the Cards finder. */
  prompt: string;
};

/** All 14 groups, in finder order. A card can belong to several groups. */
export const CARD_GROUPS: readonly CardGroup[] = [
  { id: "saints-for-kids", label: "Saint cards", prompt: "Search saints" },
  { id: "mary-for-kids", label: "Mary cards", prompt: "Mary cards" },
  { id: "advent-for-kids", label: "Advent cards", prompt: "Advent cards" },
  { id: "christmas-for-kids", label: "Christmas cards", prompt: "Christmas cards" },
  { id: "lent-for-kids", label: "Lent cards", prompt: "Lent cards" },
  { id: "easter-for-kids", label: "Easter cards", prompt: "Easter cards" },
  { id: "virtue-for-kids", label: "Virtue cards", prompt: "Virtue cards" },
  { id: "prayer-for-kids", label: "Prayer cards", prompt: "Prayer cards" },
  { id: "bible-for-kids", label: "Bible cards", prompt: "Bible cards" },
  { id: "mass-for-kids", label: "Mass & Church cards", prompt: "Mass & Church cards" },
  { id: "sacraments-for-kids", label: "Sacrament cards", prompt: "Sacrament cards" },
  { id: "church-year-for-kids", label: "Feasts & Church Year cards", prompt: "Feasts & Church Year cards" },
  { id: "fun-for-kids", label: "Fun cards", prompt: "Fun cards" },
  { id: "sacred-art-for-kids", label: "Sacred art cards", prompt: "Sacred art cards" },
];

const BY_ID = new Map(CARD_GROUPS.map((g) => [g.id, g]));

export function getCardGroup(id: string | null | undefined): CardGroup | null {
  return id ? (BY_ID.get(id as CardGroupId) ?? null) : null;
}

export function parseCardGroup(raw: string | undefined | null): CardGroupId | "" {
  return getCardGroup(raw)?.id ?? "";
}

/** Marian feasts, months and paintings outside the Mary category ("Saint Joseph, Spouse of Mary" stays out). */
const MARIAN_TITLE =
  /\b(Mary|Marian|Our Lady|Immaculate|Assumption|Annunciation|Visitation|Theotokos|Mother of God|Rosary|Madonna|Virgin)\b/i;

/** Group ids for one card. `seasons` comes from cardSeasons() so season groups match the season filter. */
export function cardGroupIds(
  card: Pick<PictureCard, "cat" | "title">,
  seasons: readonly CardSeason[],
): CardGroupId[] {
  const out: CardGroupId[] = [];
  const marianExtra =
    (card.cat === "Feast" || card.cat === "Liturgical Year" || card.cat === "Masterpiece") &&
    MARIAN_TITLE.test(card.title) &&
    !/^Saint\b/i.test(card.title);
  if (card.cat === "Saint") out.push("saints-for-kids");
  if (card.cat === "Mary" || marianExtra) out.push("mary-for-kids");
  if (seasons.includes("advent")) out.push("advent-for-kids");
  if (seasons.includes("christmas")) out.push("christmas-for-kids");
  if (seasons.includes("lent")) out.push("lent-for-kids");
  if (seasons.includes("easter")) out.push("easter-for-kids");
  if (card.cat === "Virtue & Life") out.push("virtue-for-kids");
  if (card.cat === "Prayer") out.push("prayer-for-kids");
  if (card.cat === "Bible") out.push("bible-for-kids");
  if (card.cat === "Mass & Church") out.push("mass-for-kids");
  if (card.cat === "Sacrament") out.push("sacraments-for-kids");
  if (card.cat === "Feast" || card.cat === "Liturgical Year") out.push("church-year-for-kids");
  if (card.cat === "Fun & Collectible") out.push("fun-for-kids");
  if (card.cat === "Masterpiece") out.push("sacred-art-for-kids");
  return out;
}
