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
  description: string;
  correctColor: VestmentColor;
  hint?: string;
};

export const VESTMENT_COLORS: Record<
  VestmentColor,
  { label: string; hex: string; stroke: string }
> = {
  green: { label: "Green", hex: "#388e3c", stroke: "#1b5e20" },
  purple: { label: "Purple", hex: "#6a1b9a", stroke: "#4a148c" },
  lavender: { label: "Lavender", hex: "#b39ddb", stroke: "#7e57c2" },
  white: { label: "White", hex: "#fafafa", stroke: "#9e9e9e" },
  red: { label: "Red", hex: "#c62828", stroke: "#b71c1c" },
  rose: { label: "Pink", hex: "#f06292", stroke: "#c2185b" },
};

/** One round per liturgical color — all six are played each game, in random order. */
export const LITURGICAL_DRESS_ROUNDS: LiturgicalDressRound[] = [
  {
    id: "ordinary",
    title: "Ordinary Time",
    description: "Most Sundays of the year—we listen to Jesus and grow as his friends.",
    correctColor: "green",
    hint: "The Church wears green when it is not a special feast season.",
  },
  {
    id: "advent",
    title: "Advent",
    description: "We wait and prepare with hope for the birth of Jesus at Christmas.",
    correctColor: "purple",
    hint: "A quiet, prayerful season before Christmas.",
  },
  {
    id: "lent",
    title: "Lent",
    description: "Forty days of prayer, fasting, and giving alms before Easter.",
    correctColor: "lavender",
    hint: "A penitential season—vestments are often a lighter violet or lavender.",
  },
  {
    id: "christmas",
    title: "Christmas Season",
    description: "We celebrate that Jesus Christ, the Son of God, was born for us.",
    correctColor: "white",
    hint: "White stands for joy, light, and holiness.",
  },
  {
    id: "pentecost",
    title: "Pentecost",
    description: "The Holy Spirit comes upon the Apostles and the whole Church.",
    correctColor: "red",
    hint: "Red reminds us of fire and the love of God poured out.",
  },
  {
    id: "gaudete",
    title: "Gaudete Sunday (Advent)",
    description: "A joyful Sunday in Advent—the Church rejoices because Christmas is near.",
    correctColor: "rose",
    hint: "On this day priests may wear rose or pink vestments.",
  },
];

/** Fisher–Yates shuffle; returns every color round once per game. */
export function shuffleRounds(): LiturgicalDressRound[] {
  const pool = [...LITURGICAL_DRESS_ROUNDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}
