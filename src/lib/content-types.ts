export type LiturgicalPeriodId =
  | "advent"
  | "christmas"
  | "lent"
  | "holy-week"
  | "easter"
  | "ordinary"
  | "general";

export type LiturgicalPeriod = {
  id: LiturgicalPeriodId;
  title: string;
  description: string;
};

export const LITURGICAL_PERIODS: LiturgicalPeriod[] = [
  {
    id: "advent",
    title: "Advent",
    description: "Waiting in hope—wreaths, Jesse trees, and preparation for Christmas.",
  },
  {
    id: "christmas",
    title: "Christmas Season",
    description: "Nativity crafts, Epiphany, and Christmastide celebrations.",
  },
  {
    id: "lent",
    title: "Lent",
    description: "Prayer, fasting, almsgiving, and repentance for children.",
  },
  {
    id: "holy-week",
    title: "Holy Week & Triduum",
    description: "Palm Sunday through Easter Vigil—solemn and sacred activities.",
  },
  {
    id: "easter",
    title: "Easter Season",
    description: "Resurrection joy, Ascension, and Pentecost through Eastertide.",
  },
  {
    id: "ordinary",
    title: "Ordinary Time",
    description: "Sunday Gospel themes, saints, and year-round catechesis.",
  },
  {
    id: "general",
    title: "All Year",
    description: "Sacraments, prayers, and topics for any season.",
  },
];

export function getLiturgicalPeriod(id: LiturgicalPeriodId): LiturgicalPeriod {
  return LITURGICAL_PERIODS.find((p) => p.id === id) ?? LITURGICAL_PERIODS[6];
}

export type CurriculumTrack = {
  slug: string;
  stage: string;
  title: string;
  description: string;
  lessonCount: number;
};

export type ResourcePost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  grade: string;
  topic: string;
  liturgicalPeriod: LiturgicalPeriodId;
  downloadLabel?: string;
  downloadUrl?: string;
  content: string;
  contentFormat?: string;
};

export function parseLiturgicalPeriodParam(
  value: string | undefined,
): LiturgicalPeriodId | undefined {
  if (!value || value === "all") return undefined;
  const valid: LiturgicalPeriodId[] = [
    "advent",
    "christmas",
    "lent",
    "holy-week",
    "easter",
    "ordinary",
    "general",
  ];
  return valid.includes(value as LiturgicalPeriodId)
    ? (value as LiturgicalPeriodId)
    : undefined;
}
