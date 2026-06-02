export type VestmentColor =
  | "green"
  | "purple"
  | "lavender"
  | "white"
  | "red"
  | "rose";

export type LiturgicalDressRound = {
  id: string;
  title: string;
  correctColor: VestmentColor;
};

export const VESTMENT_COLORS: Record<
  VestmentColor,
  { label: string; hex: string; stroke: string }
> = {
  green: { label: "Green", hex: "#388e3c", stroke: "#1b5e20" },
  purple: { label: "Purple", hex: "#6a1b9a", stroke: "#4a148c" },
  lavender: { label: "Light purple", hex: "#b39ddb", stroke: "#7e57c2" },
  white: { label: "White", hex: "#fafafa", stroke: "#9e9e9e" },
  red: { label: "Red", hex: "#c62828", stroke: "#b71c1c" },
  rose: { label: "Pink", hex: "#f06292", stroke: "#c2185b" },
};

/** Advent & Lent include Sunday-by-Sunday vestment colors. */
export const LITURGICAL_DRESS_ROUNDS: LiturgicalDressRound[] = [
  { id: "ordinary", title: "Ordinary Time", correctColor: "green" },
  { id: "christmas", title: "Christmas Season", correctColor: "white" },
  { id: "pentecost", title: "Pentecost", correctColor: "red" },
  { id: "advent-1", title: "Advent — 1st Sunday", correctColor: "purple" },
  { id: "advent-2", title: "Advent — 2nd Sunday", correctColor: "lavender" },
  { id: "advent-gaudete", title: "Advent — 3rd Sunday (Gaudete)", correctColor: "rose" },
  { id: "advent-4", title: "Advent — 4th Sunday", correctColor: "purple" },
  { id: "lent-1", title: "Lent — 1st Sunday", correctColor: "purple" },
  { id: "lent-2", title: "Lent — 2nd Sunday", correctColor: "lavender" },
  { id: "lent-3", title: "Lent — 3rd Sunday", correctColor: "purple" },
  { id: "lent-laetare", title: "Lent — 4th Sunday (Laetare)", correctColor: "rose" },
  { id: "lent-5", title: "Lent — 5th Sunday", correctColor: "purple" },
];

export function shuffleRounds(): LiturgicalDressRound[] {
  const pool = [...LITURGICAL_DRESS_ROUNDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}
