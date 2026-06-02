import type { VestmentColor } from "@/lib/liturgical-vestments-game";

/** Shared coordinate system for all vestment layers (width × height). */
export const VESTMENT_VIEWBOX = { width: 240, height: 480 } as const;

/**
 * Optional PNG overrides (same viewBox aspect 1:2).
 * Place files under `public/games/liturgical-vestments/` to replace inline SVG art.
 */
export const VESTMENT_PNG_LAYERS = {
  baseCassock: "/games/liturgical-vestments/priest-cassock.png",
  alb: "/games/liturgical-vestments/alb.png",
  chasuble: (color: VestmentColor) =>
    `/games/liturgical-vestments/chasuble-${color}.png`,
} as const;

export type ChasublePalette = {
  body: string;
  orphrey: string;
  trim: string;
  cross: string;
};

export const CHASUBLE_PALETTES: Record<VestmentColor, ChasublePalette> = {
  green: {
    body: "#1b5e20",
    orphrey: "#43a047",
    trim: "#c9a227",
    cross: "#fffde7",
  },
  purple: {
    body: "#4a148c",
    orphrey: "#7b1fa2",
    trim: "#c9a227",
    cross: "#fffde7",
  },
  white: {
    body: "#f5f5f5",
    orphrey: "#e0e0e0",
    trim: "#c9a227",
    cross: "#5d4037",
  },
  red: {
    body: "#7f0000",
    orphrey: "#c62828",
    trim: "#c9a227",
    cross: "#fffde7",
  },
  rose: {
    body: "#ad1457",
    orphrey: "#f06292",
    trim: "#c9a227",
    cross: "#fffde7",
  },
};
