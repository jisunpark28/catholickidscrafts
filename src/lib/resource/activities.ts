// Printable activities (coloring sheets, make-at-home pages) in the Resource library.
// DB-free and client-safe: the catalog holds only public data. The PDFs live in
// assets/activities (never public) and are served by the signed-in download route.
import type { ResourceSeason } from "@/lib/resource/sheets";

export type ActivityVariant = "bw" | "color";
export const ACTIVITY_VARIANTS: readonly ActivityVariant[] = ["bw", "color"];

export type ResourceActivity = {
  slug: string;
  title: string;
  /** Short type label on tiles ("Coloring sheet"). */
  kind: string;
  /** One line for tiles and the detail page. */
  summary: string;
  /** Meta description (about 150 characters). */
  description: string;
  seasons: ResourceSeason[];
  /** Extra search words (not shown). */
  keywords: string[];
  pageSize: "US Letter";
  /** Public low-resolution previews (the full PDFs need sign-in). */
  previews: Record<ActivityVariant, string>;
  /** PDF file names inside assets/activities/<slug>/. */
  files: Record<ActivityVariant, string>;
  /** Q&A card "Try this" lines that should link to this activity (compared case-insensitively). */
  tryThis: string[];
  /** Order in the library (lower first). */
  prio: number;
};

export const ACTIVITY_PATH = "/resource/activity";

export const RESOURCE_ACTIVITIES: readonly ResourceActivity[] = [
  {
    slug: "happy-new-church-year",
    title: "Happy New Church Year",
    kind: "Coloring sheet",
    summary: "Colour the seasons of the Church year on one simple wheel, starting with Advent.",
    description:
      "Free Catholic coloring sheet for kids: colour the liturgical year wheel from Advent to Ordinary Time. US Letter, black and white or colour.",
    seasons: ["advent"],
    keywords: [
      "liturgical year",
      "church year",
      "liturgical calendar",
      "wheel",
      "coloring",
      "colouring",
      "seasons",
      "new year",
      "first sunday of advent",
      "liturgical colors",
      "activity",
    ],
    pageSize: "US Letter",
    previews: {
      bw: "/images/activities/happy-new-church-year/preview-bw.webp",
      color: "/images/activities/happy-new-church-year/preview-color.webp",
    },
    files: {
      bw: "happy-new-church-year.pdf",
      color: "happy-new-church-year-color.pdf",
    },
    tryThis: ["Make a 'Happy New Church Year' card."],
    prio: 0,
  },
];

export const ACTIVITY_VARIANT_LABELS: Record<ActivityVariant, string> = {
  bw: "Black & white",
  color: "Colour",
};

export function getActivity(slug: string | null | undefined): ResourceActivity | null {
  if (!slug) return null;
  return RESOURCE_ACTIVITIES.find((a) => a.slug === slug) ?? null;
}

export function parseActivityVariant(v: string | null | undefined): ActivityVariant | null {
  return v === "bw" || v === "color" ? v : null;
}

export function activityPath(slug: string): string {
  return `${ACTIVITY_PATH}/${slug}`;
}

export function activityEditPath(slug: string): string {
  return `${ACTIVITY_PATH}/${slug}/edit`;
}

export function activityDownloadPath(slug: string, variant: ActivityVariant): string {
  return `/api/resource/activities/${slug}/download?variant=${variant}`;
}

export function activityEditorDocPath(slug: string): string {
  return `/api/resource/activities/${slug}/editor`;
}

/** catholickidscrafts-happy-new-church-year-color.pdf */
export function activityFileName(activity: Pick<ResourceActivity, "slug">, variant: ActivityVariant, suffix = ""): string {
  return `catholickidscrafts-${activity.slug}${variant === "color" ? "-color" : ""}${suffix}.pdf`;
}

const normTry = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d"']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** The activity a Q&A card's "Try this" line points to, if any. */
export function activityForTryThis(text: string | null | undefined): ResourceActivity | null {
  if (!text) return null;
  const t = normTry(text);
  return RESOURCE_ACTIVITIES.find((a) => a.tryThis.some((line) => normTry(line) === t)) ?? null;
}

export function listActivities(season: ResourceSeason | null = null): ResourceActivity[] {
  return RESOURCE_ACTIVITIES.filter((a) => !season || a.seasons.includes(season))
    .slice()
    .sort((a, b) => a.prio - b.prio || a.slug.localeCompare(b.slug));
}
