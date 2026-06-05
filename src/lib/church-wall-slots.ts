/** Wall picture slots in Tiny Priest — keep in sync with public/games/tiny-priest/script.js */

const WALL_FRAME_Z = [-12.4, -9.0, -5.6, -2.2, 1.2, 4.6, 8.0] as const;
const WALL_FRAME_Y = 4.85;
const WALL_FRAME_INNER_W = 1.12;
const WALL_FRAME_INNER_H = 1.48;

export type ChurchWallSlot = {
  sortOrder: number;
  side: "left" | "right";
  row: number;
  label: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  width: number;
  height: number;
};

function buildSlots(): ChurchWallSlot[] {
  const slots: ChurchWallSlot[] = [];

  for (let row = 0; row < 7; row += 1) {
    const z = WALL_FRAME_Z[row]!;
    const depth =
      row === 0 ? "front (doors)" : row === 6 ? "near altar" : `row ${row + 1}`;

    slots.push({
      sortOrder: row,
      side: "left",
      row,
      label: `Left wall · ${depth}`,
      x: -15.9 + 0.34,
      y: WALL_FRAME_Y,
      z,
      rotationY: Math.PI / 2,
      width: WALL_FRAME_INNER_W,
      height: WALL_FRAME_INNER_H,
    });

    slots.push({
      sortOrder: row + 7,
      side: "right",
      row,
      label: `Right wall · ${depth}`,
      x: 15.9 - 0.34,
      y: WALL_FRAME_Y,
      z,
      rotationY: -Math.PI / 2,
      width: WALL_FRAME_INNER_W,
      height: WALL_FRAME_INNER_H,
    });
  }

  return slots;
}

export const CHURCH_WALL_SLOTS = buildSlots();

export const CHURCH_WALL_SLOT_COUNT = CHURCH_WALL_SLOTS.length;

export function getChurchWallSlot(sortOrder: number): ChurchWallSlot | undefined {
  return CHURCH_WALL_SLOTS.find((s) => s.sortOrder === sortOrder);
}

export function isStandardWallSlot(sortOrder: number): boolean {
  return sortOrder >= 0 && sortOrder < CHURCH_WALL_SLOT_COUNT;
}

export function firstEmptyWallSlot(
  occupiedSortOrders: Iterable<number>,
): ChurchWallSlot | undefined {
  const taken = new Set(occupiedSortOrders);
  return CHURCH_WALL_SLOTS.find((s) => !taken.has(s.sortOrder));
}
