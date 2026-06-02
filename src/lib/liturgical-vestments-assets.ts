import type { VestmentColor } from "@/lib/liturgical-vestments-game";

/** On-screen figure height (2× previous 480px display). */
export const VESTMENT_FIGURE_HEIGHT = 960;

export const VESTMENT_CHARACTER_IMAGES = {
  baseAlb: "/games/liturgical-vestments/character-base.png",
  dressed: (color: VestmentColor) =>
    `/games/liturgical-vestments/character-${color}.png`,
} as const;

export const VESTMENT_SPRITESHEET_SOURCE =
  "/games/liturgical-vestments/spritesheet-source.png";
