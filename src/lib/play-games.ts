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
    description: "Welcome to Tiny Church!",
    embedPath: getTinyPriestEmbedPath(),
  },
  {
    slug: "liturgical-vestments",
    title: "Liturgical vestments",
    description: "What color vestments does Father wear?",
    embedPath: "/play/liturgical-vestments",
  },
  {
    slug: "typing",
    title: "Typing Game",
    description: "Type church words before they land.",
    embedPath: "/play/typing",
  },
  {
    slug: "hangman",
    title: "Hangman",
    description: "Guess the word before the petals fall.",
    embedPath: "/games/hangman/index.html",
  },
  {
    slug: "face-to-emoji",
    title: "Face to Emoji",
    description: "Turn faces into emoji fun!",
    embedPath: "/play/face-to-emoji",
  },
  {
    slug: "emoji",
    title: "4-Cut Photo Booth",
    description: "Make a four-photo strip with stickers!",
    embedPath: "/play/photo-booth",
  },
];

export function getPlayGame(slug: string): PlayGame | undefined {
  return PLAY_GAMES.find((g) => g.slug === slug);
}
