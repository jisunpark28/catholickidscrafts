import type { VestmentColor } from "@/lib/liturgical-vestments-game";

export const VESTMENT_DEFAULT_COLOR: VestmentColor = "white";

/** All character PNGs are normalized to 960×1040. */
export const VESTMENT_CANVAS = { width: 960, height: 1040 } as const;

export const VESTMENT_CHARACTER_IMAGES = {
  dressed: (color: VestmentColor) =>
    `/games/liturgical-vestments/character-${color}.png`,
} as const;

export const VESTMENT_SPRITESHEET_SOURCE =
  "/games/liturgical-vestments/spritesheet-source.png";
