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

/**
 * Dressing-game prompts. Advent & Lent include Sunday-by-Sunday vestment colors
 * (purple, lavender, and pink/rose vary by week).
 */
export const LITURGICAL_DRESS_ROUNDS: LiturgicalDressRound[] = [
  {
    id: "ordinary",
    title: "Ordinary Time",
    description: "Most Sundays of the year—we listen to Jesus and grow as his friends.",
    correctColor: "green",
    hint: "Green is the usual color outside special seasons.",
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
    hint: "Red reminds us of fire and the Holy Spirit.",
  },
  {
    id: "advent-1",
    title: "Advent — 1st Sunday",
    description: "A new year of grace begins as we start waiting for Christmas.",
    correctColor: "purple",
    hint: "Most Advent days use purple (violet) vestments.",
  },
  {
    id: "advent-2",
    title: "Advent — 2nd Sunday",
    description: "We keep preparing our hearts while the light of Christ draws nearer.",
    correctColor: "lavender",
    hint: "Some parishes use a lighter violet or lavender on early Advent Sundays.",
  },
  {
    id: "advent-gaudete",
    title: "Advent — 3rd Sunday (Gaudete)",
    description: "“Rejoice!” The Church is joyful because the Lord is very near.",
    correctColor: "rose",
    hint: "Gaudete Sunday — priests may wear rose or pink vestments.",
  },
  {
    id: "advent-4",
    title: "Advent — 4th Sunday",
    description: "Only a few days remain before we celebrate the birth of Jesus.",
    correctColor: "purple",
    hint: "After Gaudete, Advent returns to purple until Christmas.",
  },
  {
    id: "lent-1",
    title: "Lent — 1st Sunday",
    description: "Lent begins: prayer, fasting, and helping those in need.",
    correctColor: "purple",
    hint: "Lent is a penitential season—usually purple vestments.",
  },
  {
    id: "lent-2",
    title: "Lent — 2nd Sunday",
    description: "We walk with Jesus in the desert and turn back to God.",
    correctColor: "lavender",
    hint: "A lighter violet or lavender is sometimes used in early Lent.",
  },
  {
    id: "lent-3",
    title: "Lent — 3rd Sunday",
    description: "We continue fasting and listening to God’s word.",
    correctColor: "purple",
    hint: "Most Lenten Sundays are purple before Laetare.",
  },
  {
    id: "lent-laetare",
    title: "Lent — 4th Sunday (Laetare)",
    description: "“Rejoice!” The Church takes heart—Easter is coming soon.",
    correctColor: "rose",
    hint: "Laetare Sunday — rose or pink vestments are allowed.",
  },
  {
    id: "lent-5",
    title: "Lent — 5th Sunday",
    description: "Holy Week is almost here; we prepare for the Passion of the Lord.",
    correctColor: "purple",
    hint: "When Lent has a fifth Sunday, vestments are purple again.",
  },
];

/** Fisher–Yates shuffle; every round appears once per game (order is random). */
export function shuffleRounds(): LiturgicalDressRound[] {
  const pool = [...LITURGICAL_DRESS_ROUNDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}
