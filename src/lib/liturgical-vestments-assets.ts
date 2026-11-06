import type { VestmentColor } from "@/lib/liturgical-vestments-game";

export const VESTMENT_DEFAULT_COLOR: VestmentColor = "white";

/** All character PNGs are normalized to 960×1040. */
export const VESTMENT_CANVAS = { width: 960, height: 1040 } as const;

/** Explicit, audited assets: unsupported shades cannot manufacture a URL. */
export const VESTMENT_CHARACTER_ASSETS: Record<VestmentColor, string> = {
  white: "/games/liturgical-vestments/character-white.png",
  red: "/games/liturgical-vestments/character-red.png",
  purple: "/games/liturgical-vestments/character-purple.png",
  green: "/games/liturgical-vestments/character-green.png",
  rose: "/games/liturgical-vestments/character-rose.png",
};

export const VESTMENT_CHARACTER_IMAGES = {
  dressed: (color: VestmentColor) =>
    VESTMENT_CHARACTER_ASSETS[color],
} as const;

export const VESTMENT_SPRITESHEET_SOURCE =
  "/games/liturgical-vestments/spritesheet-source.png";
