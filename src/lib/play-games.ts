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
    title: "Tiny Priest — Explore the Church",
    description:
      "Walk through a voxel church: tabernacle path, altar, holy water, and a guided Mass sequence. Arrow keys or WASD to move.",
    embedPath: "/games/tiny-priest/index.html",
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
    title: "Saint & Church Hangman",
    description:
      "Guess Catholic words and names before the flower loses its petals. Hints included.",
    embedPath: "/games/hangman/index.html",
  },
  {
    slug: "emoji",
    title: "Face to Emoji",
    description:
      "Upload a photo and replace faces with emojis—runs in your browser, private on your device.",
    embedPath: "/games/face-to-emoji/index.html",
  },
];

export function getPlayGame(slug: string): PlayGame | undefined {
  return PLAY_GAMES.find((g) => g.slug === slug);
}

