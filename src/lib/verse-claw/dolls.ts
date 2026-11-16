/** Plush prize cast for Verse Claw — soft Catholic symbols, not letter tiles. */

export type VerseClawDollId =
  | "little-sheep"
  | "peace-dove"
  | "ichthys-fish"
  | "halo-lamb"
  | "bread-friend"
  | "joy-apple"
  | "night-star"
  | "tiny-ark";

export type VerseClawDoll = {
  id: VerseClawDollId;
  name: string;
  note: string;
  /** Grid slot 0–7 (row-major 4×2). */
  slot: number;
  src: string;
  /** Soft fill under the sprite for depth. */
  glow: string;
};

export const VERSE_CLAW_DOLLS: VerseClawDoll[] = [
  {
    id: "little-sheep",
    name: "Little Sheep",
    note: "Pastoral care",
    slot: 0,
    src: "/games/verse-claw/doll-little-sheep.png",
    glow: "#ffb48a",
  },
  {
    id: "peace-dove",
    name: "Peace Dove",
    note: "Holy Spirit",
    slot: 1,
    src: "/games/verse-claw/doll-peace-dove.png",
    glow: "#c9e7d8",
  },
  {
    id: "ichthys-fish",
    name: "Ichthys Fish",
    note: "Early Christian symbol",
    slot: 2,
    src: "/games/verse-claw/doll-ichthys-fish.png",
    glow: "#9ec9e8",
  },
  {
    id: "halo-lamb",
    name: "Halo Lamb",
    note: "Christ the Lamb",
    slot: 3,
    src: "/games/verse-claw/doll-halo-lamb.png",
    glow: "#ffe6a8",
  },
  {
    id: "bread-friend",
    name: "Bread Friend",
    note: "Eucharist",
    slot: 4,
    src: "/games/verse-claw/doll-bread-friend.png",
    glow: "#e8c9a0",
  },
  {
    id: "joy-apple",
    name: "Joy Apple",
    note: "Creation gift",
    slot: 5,
    src: "/games/verse-claw/doll-joy-apple.png",
    glow: "#f5a3a3",
  },
  {
    id: "night-star",
    name: "Night Star",
    note: "Bethlehem",
    slot: 6,
    src: "/games/verse-claw/doll-night-star.png",
    glow: "#b8c4f0",
  },
  {
    id: "tiny-ark",
    name: "Tiny Ark",
    note: "Hope & family",
    slot: 7,
    src: "/games/verse-claw/doll-tiny-ark.png",
    glow: "#d4b896",
  },
];

/** Claw X/Z (0–100) center for each 4×2 slot. */
export function slotClawTarget(slot: number): { x: number; z: number } {
  const col = slot % 4;
  const row = Math.floor(slot / 4);
  return {
    x: 18 + col * 21.5,
    z: row === 0 ? 72 : 32,
  };
}

export function nearestDollSlot(clawX: number, clawZ: number): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const doll of VERSE_CLAW_DOLLS) {
    const t = slotClawTarget(doll.slot);
    const dx = clawX - t.x;
    const dz = clawZ - t.z;
    const d = dx * dx + dz * dz * 1.15;
    if (d < bestDist) {
      bestDist = d;
      best = doll.slot;
    }
  }
  return best;
}

export function dollById(id: VerseClawDollId): VerseClawDoll {
  return VERSE_CLAW_DOLLS.find((d) => d.id === id) ?? VERSE_CLAW_DOLLS[0]!;
}

export function dollBySlot(slot: number): VerseClawDoll {
  return VERSE_CLAW_DOLLS.find((d) => d.slot === slot) ?? VERSE_CLAW_DOLLS[0]!;
}
