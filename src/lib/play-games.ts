import { getTinyPriestEmbedPath } from "@/lib/tiny-priest";

export type PlayGame = {
  slug: string;
  title: string;
  description: string;
  /** Path under /games/ or external URL */
  embedPath: string;
  external?: boolean;
};

export const PLAY_GAMES: PlayGame[] = [
  {
    slug: "church",
    title: "Tiny Priest",
    description:
      "A short church walk-through for new helpers and kids—altar, tabernacle, holy water. Good for a first visit or review week.",
    embedPath: getTinyPriestEmbedPath(),
  },
  {
    slug: "liturgical-vestments",
    title: "Liturgical vestments",
    description:
      "Practice Church colors (Advent purple, Easter white, and more). Works well right before you decorate the classroom.",
    embedPath: "/play/liturgical-vestments",
  },
  {
    slug: "typing",
    title: "Typing Game",
    description:
      "Word mode for church vocabulary, or type along with today’s readings—quiet focus time or early arrivers.",
    embedPath: "/play/typing",
  },
  {
    slug: "hangman",
    title: "Hangman",
    description:
      "Classic hangman with Catholic words—easy filler when you finish early or wait for parents.",
    embedPath: "/games/hangman/index.html",
  },
  {
    slug: "emoji",
    title: "4-Cut Photo Booth",
    description:
      "Four-photo strip with stickers—fun for feast days, First Communion prep, or end-of-year parties.",
    embedPath: "/play/photo-booth",
  },
];

export function getPlayGame(slug: string): PlayGame | undefined {
  return PLAY_GAMES.find((g) => g.slug === slug);
}
