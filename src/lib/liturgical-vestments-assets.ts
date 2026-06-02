import type { VestmentColor } from "@/lib/liturgical-vestments-game";

/** Display size (exported art is scaled to this height in CSS). */
export const VESTMENT_FIGURE_HEIGHT = 480;

export const VESTMENT_CHARACTER_IMAGES = {
  baseAlb: "/games/liturgical-vestments/character-base.png",
  dressed: (color: VestmentColor) =>
    `/games/liturgical-vestments/character-${color}.png`,
} as const;

/** Replace grid: drop `spritesheet-source.png` and run `pnpm run vestments:split`. */
export const VESTMENT_SPRITESHEET_SOURCE =
  "/games/liturgical-vestments/spritesheet-source.png";
