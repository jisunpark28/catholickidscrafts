import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentRoot = path.join(process.cwd(), "content");

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
};

const curriculumTracks: CurriculumTrack[] = [
  {
    slug: "pre-k-kindergarten",
    stage: "Stage 1",
    title: "Pre-K & Kindergarten",
    description:
      "Sensory crafts, saint stories, and simple coloring pages for little ones beginning their faith journey.",
    lessonCount: 12,
  },
  {
    slug: "first-holy-communion",
    stage: "Stage 2",
    title: "First Holy Communion",
    description:
      "Reconciliation and Eucharist prep for early elementary—worksheets, games, and lesson plans teachers love.",
    lessonCount: 18,
  },
  {
    slug: "grades-3-5",
    stage: "Stage 3",
    title: "Grades 3–5",
    description:
      "Deeper catechism topics, Gospel-based quizzes, and liturgical year activities for upper elementary.",
    lessonCount: 15,
  },
  {
    slug: "liturgical-year",
    stage: "Overview",
    title: "Liturgical Year Overview",
    description:
      "How Advent, Christmas, Lent, Easter, and Ordinary Time fit together in parish life.",
    lessonCount: 8,
  },
];

export function getCurriculumTracks(): CurriculumTrack[] {
  return curriculumTracks;
}

export function getCurriculumTrack(slug: string): CurriculumTrack | undefined {
  return curriculumTracks.find((t) => t.slug === slug);
}

export function getLiturgicalPeriod(id: LiturgicalPeriodId): LiturgicalPeriod {
  return LITURGICAL_PERIODS.find((p) => p.id === id) ?? LITURGICAL_PERIODS[6];
}

function resourcesDir(): string {
  return path.join(contentRoot, "resources");
}

function parsePeriod(value: unknown): LiturgicalPeriodId {
  const valid: LiturgicalPeriodId[] = [
    "advent",
    "christmas",
    "lent",
    "holy-week",
    "easter",
    "ordinary",
    "general",
  ];
  if (typeof value === "string" && valid.includes(value as LiturgicalPeriodId)) {
    return value as LiturgicalPeriodId;
  }
  return "general";
}

export function getAllResourceSlugs(): string[] {
  const dir = resourcesDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getResourceBySlug(slug: string): ResourcePost | null {
  const filePath = path.join(resourcesDir(), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) ?? slug,
    excerpt: (data.excerpt as string) ?? "",
    date: (data.date as string) ?? "",
    grade: (data.grade as string) ?? "All",
    topic: (data.topic as string) ?? "General",
    liturgicalPeriod: parsePeriod(data.liturgicalPeriod ?? data.season),
    downloadLabel: data.downloadLabel as string | undefined,
    downloadUrl: data.downloadUrl as string | undefined,
    content,
  };
}

export function getAllResources(): ResourcePost[] {
  return getAllResourceSlugs()
    .map((slug) => getResourceBySlug(slug))
    .filter((p): p is ResourcePost => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getResourcesByPeriod(
  periodId: LiturgicalPeriodId,
): ResourcePost[] {
  return getAllResources().filter((r) => r.liturgicalPeriod === periodId);
}

export function getResourcesByGrade(grade: string): ResourcePost[] {
  return getAllResources().filter((r) => r.grade === grade);
}
