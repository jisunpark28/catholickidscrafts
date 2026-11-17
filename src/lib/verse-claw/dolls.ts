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
  /** Stable index used by grab targeting (unique per pile instance). */
  slot: number;
  src: string;
  glow: string;
  pile: VerseClawPilePose;
};

/** Half the previous 25% footprint so plushies sit smaller under the soft claw. */
const W = 12.5;

type DollBase = {
  id: VerseClawDollId;
  name: string;
  note: string;
  src: string;
  glow: string;
};

const DOLL_BASE: Record<VerseClawDollId, DollBase> = {
  "little-sheep": {
    id: "little-sheep",
    name: "Little Sheep",
    note: "Pastoral care",
    src: "/games/verse-claw/doll-little-sheep.png",
    glow: "#ffb48a",
  },
  "peace-dove": {
    id: "peace-dove",
    name: "Peace Dove",
    note: "Holy Spirit",
    src: "/games/verse-claw/doll-peace-dove.png",
    glow: "#c9e7d8",
  },
  "ichthys-fish": {
    id: "ichthys-fish",
    name: "Ichthys Fish",
    note: "Early Christian symbol",
    src: "/games/verse-claw/doll-ichthys-fish.png",
    glow: "#9ec9e8",
  },
  "halo-lamb": {
    id: "halo-lamb",
    name: "Halo Lamb",
    note: "Christ the Lamb",
    src: "/games/verse-claw/doll-halo-lamb.png",
    glow: "#ffe6a8",
  },
  "bread-friend": {
    id: "bread-friend",
    name: "Bread Friend",
    note: "Eucharist",
    src: "/games/verse-claw/doll-bread-friend.png",
    glow: "#e8c9a0",
  },
  "joy-apple": {
    id: "joy-apple",
    name: "Joy Apple",
    note: "Creation gift",
    src: "/games/verse-claw/doll-joy-apple.png",
    glow: "#f5a3a3",
  },
  "night-star": {
    id: "night-star",
    name: "Night Star",
    note: "Bethlehem",
    src: "/games/verse-claw/doll-night-star.png",
    glow: "#b8c4f0",
  },
  "tiny-ark": {
    id: "tiny-ark",
    name: "Tiny Ark",
    note: "Hope & family",
    src: "/games/verse-claw/doll-tiny-ark.png",
    glow: "#d4b896",
  },
};

/** Pile instance: reuse cast art for a denser floor while verses stay keyed by doll id. */
type PileSpec = {
  id: VerseClawDollId;
  left: number;
  bottom: number;
  rotate: number;
  z: number;
};

/**
 * Dense wide floor: 16 half-size plushies (each art appears twice) spanning the
 * cabinet with clear air above for the resting claw — not a flat grid.
 */
const PILE_SPECS: PileSpec[] = [
  // Front row
  { id: "ichthys-fish", left: -1, bottom: 0, rotate: -22, z: 12 },
  { id: "tiny-ark", left: 10, bottom: 1, rotate: -4, z: 11 },
  { id: "bread-friend", left: 22, bottom: 0, rotate: 6, z: 13 },
  { id: "joy-apple", left: 34, bottom: 1, rotate: -14, z: 14 },
  { id: "night-star", left: 46, bottom: 0, rotate: 12, z: 13 },
  { id: "ichthys-fish", left: 58, bottom: 1, rotate: 18, z: 12 },
  { id: "joy-apple", left: 70, bottom: 0, rotate: -8, z: 14 },
  { id: "night-star", left: 82, bottom: 1, rotate: 20, z: 11 },
  // Mid / back row
  { id: "little-sheep", left: 4, bottom: 10, rotate: -12, z: 6 },
  { id: "halo-lamb", left: 18, bottom: 12, rotate: 8, z: 5 },
  { id: "peace-dove", left: 32, bottom: 9, rotate: -6, z: 7 },
  { id: "little-sheep", left: 46, bottom: 11, rotate: 10, z: 4 },
  { id: "halo-lamb", left: 58, bottom: 10, rotate: -10, z: 5 },
  { id: "peace-dove", left: 72, bottom: 12, rotate: 16, z: 6 },
  { id: "tiny-ark", left: 28, bottom: 16, rotate: 4, z: 3 },
  { id: "bread-friend", left: 64, bottom: 15, rotate: -14, z: 3 },
];

export const VERSE_CLAW_DOLLS: VerseClawDoll[] = PILE_SPECS.map((spec, slot) => {
  const base = DOLL_BASE[spec.id];
  return {
    ...base,
    slot,
    pile: { left: spec.left, bottom: spec.bottom, rotate: spec.rotate, z: spec.z, width: W },
  };
});

/** Soft filler felt balls (decorative only) — scattered under the denser pile. */
export const VERSE_CLAW_FELT_BALLS: Array<{
  src: string;
  left: number;
  bottom: number;
  size: number;
  rotate: number;
  z: number;
}> = [
  { src: "/games/verse-claw/felt-cream.png", left: 16, bottom: 4, size: 5, rotate: 0, z: 2 },
  { src: "/games/verse-claw/felt-blue.png", left: 40, bottom: 6, size: 5, rotate: 20, z: 2 },
  { src: "/games/verse-claw/felt-pink.png", left: 54, bottom: 5, size: 4, rotate: -12, z: 2 },
  { src: "/games/verse-claw/felt-peach.png", left: 76, bottom: 8, size: 5, rotate: 8, z: 1 },
  { src: "/games/verse-claw/felt-cream.png", left: 8, bottom: 14, size: 4, rotate: -18, z: 1 },
  { src: "/games/verse-claw/felt-blue.png", left: 88, bottom: 2, size: 5, rotate: 5, z: 2 },
  { src: "/games/verse-claw/felt-pink.png", left: 30, bottom: 8, size: 4, rotate: 14, z: 1 },
  { src: "/games/verse-claw/felt-peach.png", left: 66, bottom: 3, size: 5, rotate: -6, z: 2 },
];

/** Claw aim point for a doll’s pile pose. */
export function slotClawTarget(slot: number): { x: number; z: number } {
  const doll = dollBySlot(slot);
  const { left, bottom, width, z } = doll.pile;
  const x = Math.min(88, Math.max(12, left + width * 0.45));
  // Higher bottom + higher z → closer to player (larger claw depth).
  const depth = 18 + bottom * 0.85 + Math.min(z, 14) * 1.6;
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
