import type { VestmentColor } from "@/lib/liturgical-vestments-game";

/** Default figure before a color is chosen (white alb / white vestments). */
export const VESTMENT_DEFAULT_COLOR: VestmentColor = "white";

export const VESTMENT_CHARACTER_IMAGES = {
  dressed: (color: VestmentColor) =>
    `/games/liturgical-vestments/character-${color}.png`,
} as const;

export const VESTMENT_SPRITESHEET_SOURCE =
  "/games/liturgical-vestments/spritesheet-source.png";
