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

/** Irregular pile pose inside the cabinet (percentages + depth). Size stays stable — depth via overlap/shadow only. */
export type VerseClawPilePose = {
  left: number;
  bottom: number;
  rotate: number;
  z: number;
  /** Stable footprint % — keep near-uniform so dolls do not pulse in size. */
  width: number;
};

export type VerseClawDoll = {
  id: VerseClawDollId;
  name: string;
  note: string;
  /** Stable index 0–7 used by grab targeting. */
  slot: number;
  src: string;
  glow: string;
  pile: VerseClawPilePose;
};

/**
 * Wide floor nestle: dolls span the full cabinet width with clear air above
 * for the resting claw. Foreground fish/apple/star, mid bread/ark/sheep,
 * background halo lamb + dove — not a flat grid or center cluster.
 */
export const VERSE_CLAW_DOLLS: VerseClawDoll[] = [
  {
    id: "little-sheep",
    name: "Little Sheep",
    note: "Pastoral care",
    slot: 0,
    src: "/games/verse-claw/doll-little-sheep.png",
    glow: "#ffb48a",
    pile: { left: 8, bottom: 8, rotate: -10, z: 4, width: 25 },
  },
  {
    id: "peace-dove",
    name: "Peace Dove",
    note: "Holy Spirit",
    slot: 1,
    src: "/games/verse-claw/doll-peace-dove.png",
    glow: "#c9e7d8",
    pile: { left: 66, bottom: 11, rotate: 14, z: 5, width: 25 },
  },
  {
    id: "ichthys-fish",
    name: "Ichthys Fish",
    note: "Early Christian symbol",
    slot: 2,
    src: "/games/verse-claw/doll-ichthys-fish.png",
    glow: "#9ec9e8",
    pile: { left: -2, bottom: 0, rotate: -22, z: 9, width: 25 },
  },
  {
    id: "halo-lamb",
    name: "Halo Lamb",
    note: "Christ the Lamb",
    slot: 3,
    src: "/games/verse-claw/doll-halo-lamb.png",
    glow: "#ffe6a8",
    pile: { left: 40, bottom: 9, rotate: 8, z: 3, width: 25 },
  },
  {
    id: "bread-friend",
    name: "Bread Friend",
    note: "Eucharist",
    slot: 4,
    src: "/games/verse-claw/doll-bread-friend.png",
    glow: "#e8c9a0",
    pile: { left: 26, bottom: 2, rotate: 5, z: 7, width: 25 },
  },
  {
    id: "joy-apple",
    name: "Joy Apple",
    note: "Creation gift",
    slot: 5,
    src: "/games/verse-claw/doll-joy-apple.png",
    glow: "#f5a3a3",
    pile: { left: 52, bottom: 0, rotate: -12, z: 10, width: 25 },
  },
  {
    id: "night-star",
    name: "Night Star",
    note: "Bethlehem",
    slot: 6,
    src: "/games/verse-claw/doll-night-star.png",
    glow: "#b8c4f0",
    pile: { left: 80, bottom: 1, rotate: 16, z: 8, width: 25 },
  },
  {
    id: "tiny-ark",
    name: "Tiny Ark",
    note: "Hope & family",
    slot: 7,
    src: "/games/verse-claw/doll-tiny-ark.png",
    glow: "#d4b896",
    pile: { left: 16, bottom: 1, rotate: -3, z: 6, width: 25 },
  },
];

/** Soft filler felt balls (decorative only) — scattered across the wide floor. */
export const VERSE_CLAW_FELT_BALLS: Array<{
  src: string;
  left: number;
  bottom: number;
  size: number;
  rotate: number;
  z: number;
}> = [
  { src: "/games/verse-claw/felt-cream.png", left: 34, bottom: 1, size: 8, rotate: 0, z: 2 },
  { src: "/games/verse-claw/felt-blue.png", left: 4, bottom: 10, size: 7, rotate: 20, z: 2 },
  { src: "/games/verse-claw/felt-pink.png", left: 90, bottom: 12, size: 7, rotate: -12, z: 2 },
  { src: "/games/verse-claw/felt-peach.png", left: 60, bottom: 8, size: 8, rotate: 8, z: 1 },
  { src: "/games/verse-claw/felt-cream.png", left: 22, bottom: 16, size: 7, rotate: -18, z: 1 },
  { src: "/games/verse-claw/felt-blue.png", left: 74, bottom: 0, size: 8, rotate: 5, z: 3 },
];

/** Claw aim point for a doll’s pile pose. */
export function slotClawTarget(slot: number): { x: number; z: number } {
  const doll = dollBySlot(slot);
  const { left, bottom, width, z } = doll.pile;
  const x = Math.min(88, Math.max(12, left + width * 0.45));
  // Higher bottom + higher z → closer to player (larger claw depth).
  const depth = 18 + bottom * 0.85 + Math.min(z, 10) * 2.2;
  const zz = Math.min(92, Math.max(12, depth));
  return { x, z: zz };
}

export function nearestDollSlot(clawX: number, clawZ: number): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const doll of VERSE_CLAW_DOLLS) {
    const t = slotClawTarget(doll.slot);
    const dx = clawX - t.x;
    const dz = clawZ - t.z;
    const d = dx * dx + dz * dz * 1.1;
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
