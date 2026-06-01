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
      "Walk through a voxel church: tabernacle path, altar, holy water, and a guided Mass sequence. Arrow keys or WASD to move.",
    embedPath: "/games/tiny-priest/index.html",
  },
  {
    slug: "liturgical-vestments",
    title: "Liturgical vestments",
    description:
      "Dress the priest in the right color for Advent, Lent, Easter, and more—Tiny Priest style.",
    embedPath: "/play/liturgical-vestments",
  },
  {
    slug: "typing",
    title: "Typing Game",
    description:
      "Word mode: type falling vocabulary. Today’s Bible: choose First Reading, Second Reading, or Gospel from Daily Mass.",
    embedPath: "/play/typing",
  },
  {
    slug: "hangman",
    title: "Hangman game",
    description:
      "Guess Catholic words and names before the flower loses its petals. Hints included.",
    embedPath: "/games/hangman/index.html",
  },
  {
    slug: "emoji",
    title: "4-Cut Photo Booth",
    description:
      "Upload or use your camera, then decorate with backgrounds and stickers—make a four-photo strip.",
    embedPath: "/play/photo-booth",
  },
];

export function getPlayGame(slug: string): PlayGame | undefined {
  return PLAY_GAMES.find((g) => g.slug === slug);
}

