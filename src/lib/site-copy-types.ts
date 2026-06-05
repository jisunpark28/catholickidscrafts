export type SiteCopyFormat = "plain" | "markdown";

export type SiteCopySeed = {
  key: string;
  value: string;
  group: string;
  hint?: string;
  format?: SiteCopyFormat;
};

export type SiteCopyMap = Record<string, string>;

export const SITE_COPY_GROUPS = [
  { id: "global", label: "Global (nav & footer)" },
  { id: "home", label: "Home" },
  { id: "mass", label: "Daily Mass" },
  { id: "resources", label: "Kids Resources" },
  { id: "curriculum", label: "Curriculum" },
  { id: "recommendations", label: "Recommendations" },
  { id: "play", label: "Play hub & games list" },
  { id: "play_typing", label: "Typing game" },
  { id: "play_vestments", label: "Liturgical vestments" },
  { id: "play_photobooth", label: "Photo booth" },
  { id: "legal", label: "About & legal pages" },
  { id: "taxonomy", label: "Season labels & filters" },
  { id: "game_tiny_priest", label: "Tiny Priest game" },
  { id: "game_hangman", label: "Hangman game" },
] as const;
