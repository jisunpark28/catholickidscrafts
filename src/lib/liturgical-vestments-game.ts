export type VestmentColor = "green" | "purple" | "white" | "red" | "rose";

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
  purple: { label: "Purple", hex: "#7b1fa2", stroke: "#4a148c" },
  white: { label: "White", hex: "#fafafa", stroke: "#9e9e9e" },
  red: { label: "Red", hex: "#c62828", stroke: "#b71c1c" },
  rose: { label: "Rose", hex: "#f06292", stroke: "#c2185b" },
};

/** Rounds for the vestment dressing game (kid-friendly). */
export const LITURGICAL_DRESS_ROUNDS: LiturgicalDressRound[] = [
  {
    id: "advent",
    title: "Advent",
    description: "The Church waits in hope for Jesus to come.",
    correctColor: "purple",
    hint: "A time of preparation before Christmas.",
  },
  {
    id: "lent",
    title: "Lent",
    description: "Forty days of prayer and fasting before Easter.",
    correctColor: "purple",
  },
  {
    id: "ordinary",
    title: "Ordinary Time",
    description: "Most Sundays of the year—we grow as disciples.",
    correctColor: "green",
  },
  {
    id: "christmas",
    title: "Christmas Season",
    description: "We celebrate the birth of Jesus Christ.",
    correctColor: "white",
  },
  {
    id: "easter",
    title: "Easter",
    description: "Christ is risen! Alleluia!",
    correctColor: "white",
  },
  {
    id: "pentecost",
    title: "Pentecost",
    description: "The Holy Spirit comes to the Church.",
    correctColor: "red",
  },
  {
    id: "palm",
    title: "Palm Sunday",
    description: "We remember Jesus entering Jerusalem.",
    correctColor: "red",
  },
  {
    id: "gaudete",
    title: "Gaudete Sunday (Advent)",
    description: "A joyful Sunday in Advent—rose vestments are allowed!",
    correctColor: "rose",
  },
  {
    id: "laetare",
    title: "Laetare Sunday (Lent)",
    description: "A Sunday of hope in the middle of Lent.",
    correctColor: "rose",
  },
  {
    id: "martyr",
    title: "Feast of a Martyr",
    description: "The Church honors someone who died for faith.",
    correctColor: "red",
  },
];

export function shuffleRounds(count = 6): LiturgicalDressRound[] {
  const pool = [...LITURGICAL_DRESS_ROUNDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
