// Every valid sheet key (188): 3 cycles x 59 Sunday keys + 11 shared keys.

export const CYCLES = ["A", "B", "C"] as const;
export type Cycle = (typeof CYCLES)[number];

function range(prefix: string, from: number, to: number): string[] {
  const out: string[] = [];
  for (let n = from; n <= to; n++) out.push(`${prefix}${String(n).padStart(2, "0")}`);
  return out;
}

/** Cycle-dependent Sunday keys (without the A_/B_/C_ prefix), in TOC order. */
export const SUNDAY_KEYS: readonly string[] = [
  ...range("ADV", 1, 4),
  "CHRISTMAS",
  "HOLYFAMILY",
  "MARYMOTHER",
  "EPIPHANY",
  "BAPTISM",
  ...range("OT", 2, 8),
  ...range("LNT", 1, 5),
  "PALM",
  "EASTER",
  ...range("EAS", 2, 6),
  "ASCENSION",
  "EAS07",
  "PENTECOST",
  "TRINITY",
  "CORPUSCHRISTI",
  ...range("OT", 9, 34),
];

/** Cycle-independent keys (Sunday replacements). */
export const SHARED_KEYS: readonly string[] = [
  "XMAS2",
  "SOL_PRESENTATION",
  "SOL_JOHNBAPTIST",
  "SOL_PETERPAUL",
  "SOL_TRANSFIGURATION",
  "SOL_ASSUMPTION",
  "SOL_HOLYCROSS",
  "SOL_ALLSAINTS",
  "SOL_ALLSOULS",
  "SOL_LATERAN",
  "SOL_IMMACULATE",
];

export const ALL_SHEET_KEYS: readonly string[] = [
  ...CYCLES.flatMap((c) => SUNDAY_KEYS.map((k) => `${c}_${k}`)),
  ...SHARED_KEYS,
];

const VALID = new Set(ALL_SHEET_KEYS);

export function isValidSheetKey(key: string): boolean {
  return VALID.has(key);
}
