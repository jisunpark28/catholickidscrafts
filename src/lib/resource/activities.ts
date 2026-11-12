// Printable activities (coloring sheets, make-at-home pages) in the Resource library.
// DB-free and client-safe: the catalog holds only public data. The PDFs live in
// assets/activities (never public) and are served by the signed-in download route.
import type { ResourceSeason } from "@/lib/resource/sheets";

export type ActivityVariant = "bw" | "color";
/** Who can download the PDF: any signed-in family, or Plus only (checked on the server). */
export type ActivityAccess = "signin" | "plus";
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
  /** "signin": free with sign-in. "plus": Plus members only (the download API checks familyHasPlus). */
  access: ActivityAccess;
  /** Page <title> (without the site name). */
  seoTitle: string;
};

export const ACTIVITY_PATH = "/resource/activity";

type DailyRow = [slug: string, title: string, kind: string, tryThis: string, summary: string, keywords: string[]];

/** Daily Advent sheets: one per Q&A card "Try this" tip, free with sign-in. */
function DAILY(rows: DailyRow[]): ResourceActivity[] {
  return rows.map(([slug, title, kind, tryThis, summary, keywords], i) => ({
    slug,
    title,
    kind,
    summary,
    description: `Free Catholic Advent ${kind.toLowerCase()} for kids: ${summary.charAt(0).toLowerCase()}${summary.slice(1)} US Letter, black and white or colour.`,
    seasons: ["advent"],
    keywords: [...keywords, "advent", "activity", "printable"],
    pageSize: "US Letter",
    previews: {
      bw: `/images/activities/${slug}/preview-bw.webp`,
      color: `/images/activities/${slug}/preview-color.webp`,
    },
    files: { bw: `${slug}.pdf`, color: `${slug}-color.pdf` },
    tryThis: [tryThis],
    prio: 10 + i,
    access: "signin",
    seoTitle: `${title} (Advent ${kind})`,
  }));
}

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
    access: "signin",
    seoTitle: "Happy New Church Year Coloring Sheet",
  },
  ...DAILY([
    ["jesse-tree-ornaments", "Jesse Tree Ornaments", "Cut-out sheet", "Make a Jesse tree ornament.",
      "Colour and cut out six round ornaments for Jesse, Noah, Abraham, Jacob, King David and Isaiah.",
      ["jesse tree", "ornaments", "prophets", "isaiah", "cut out", "waiting for jesus"]],
    ["prepare-the-way", "Prepare the Way", "Habit tracker", "Clean up one \u201cmessy\u201d habit this week.",
      "With John the Baptist, pick one messy habit and colour a stepping stone each day you try.",
      ["john the baptist", "habit", "tracker", "prepare the way", "repent", "jordan"]],
    ["yes-with-a-smile", "Yes With a Smile", "Chore chart", "Say yes to a chore with a smile.",
      "Like Mary, say yes: pick a chore and colour a smiley face each day you do it with a smile.",
      ["mary", "annunciation", "chore chart", "yes to god", "gabriel", "helping"]],
    ["white-flower-for-mary", "A White Flower for Mary", "Coloring sheet", "Put a white flower by a picture of Mary.",
      "Colour a vase of white flowers for the Immaculate Conception, December 8.",
      ["immaculate conception", "mary", "flower", "december 8", "holy day", "coloring"]],
    ["come-lord-jesus", "Come, Lord Jesus", "Prayer chart", "Pray \u201cCome, Lord Jesus\u201d each night.",
      "A night-sky prayer chart: colour one star each night you pray \u201cCome, Lord Jesus.\u201d",
      ["prayer", "night prayer", "second coming", "come lord jesus", "stars", "chart"]],
    ["straw-for-the-manger", "Straw for the Manger", "Cut-and-glue sheet", "Add one piece of straw to a manger for each kind act.",
      "Cut out straw, write a kind act on each piece and glue it in the manger to make a soft bed for baby Jesus.",
      ["manger", "straw", "kind acts", "kindness", "nativity", "cut and glue"]],
    ["jesse-tree-picture-a-day", "Jesse Tree: One Picture a Day", "Drawing sheet", "Hang one Jesse tree picture each day.",
      "A Jesse tree with twelve circles: draw one Bible story picture each day of Advent.",
      ["jesse tree", "bible stories", "drawing", "tree", "advent daily"]],
    ["helping-hands-like-mary", "Helping Hands Like Mary", "Helper chart", "Help someone in your family this week.",
      "Mary hurried to help Elizabeth. Colour a heart each time you help someone in your family.",
      ["visitation", "elizabeth", "mary", "helping", "family", "chart"]],
    ["secret-kindness-notes", "Secret Kindness Notes", "Cut-out notes", "Leave a secret kind surprise for someone.",
      "Four cut-out notes for secret kind surprises, like Saint Nicholas. December 6.",
      ["saint nicholas", "st nicholas", "december 6", "kindness", "notes", "secret"]],
    ["roses-for-mary", "Roses for Mary", "Drawing sheet", "Draw roses for Mary.",
      "Learn to draw a rose in four steps, then fill the frame with roses for Our Lady of Guadalupe.",
      ["our lady of guadalupe", "juan diego", "roses", "mary", "december 12", "drawing"]],
    ["o-antiphon-ornaments", "O Antiphon Ornaments", "Cut-out sheet", "Make seven little paper ornaments, one for each name.",
      "Seven cut-out ornaments for the O Antiphons, December 17 to 23, one name for Jesus each day.",
      ["o antiphons", "emmanuel", "names of jesus", "ornaments", "december 17"]],
    ["family-advent-calendar", "Family Advent Calendar", "Calendar", "Make a family Advent calendar of kind acts.",
      "Advent 2026 calendar, November 29 to December 24: write one kind act in each box.",
      ["advent calendar", "family", "kind acts", "calendar", "2026"]],
    ["colour-the-advent-candles", "Colour the Advent Candles", "Coloring sheet", "Colour the four Advent candles.",
      "Colour three purple candles and one pink candle for Gaudete Sunday.",
      ["advent candles", "purple", "pink", "rose", "gaudete", "coloring", "advent wreath"]],
    ["paper-advent-wreath", "Paper Advent Wreath", "Cut-and-glue sheet", "Make a paper Advent wreath.",
      "Colour the wreath, cut out four candles and glue them on. The round wreath has no end, like God's love.",
      ["advent wreath", "paper wreath", "candles", "cut and glue", "craft"]],
    ["light-the-advent-candle", "Light the Advent Candle", "Family sheet", "Light the Advent wreath candle at dinner.",
      "Light one more Advent candle each Sunday at dinner, with grace before meals and a four-week checklist.",
      ["advent wreath", "dinner", "grace before meals", "family prayer", "first sunday of advent"]],
  ]),
  {
    slug: "advent-candle-craft",
    title: "Advent Candle Craft",
    kind: "Craft",
    summary: "Cut, fold and glue four Advent candles (3 violet, 1 rose) with flames on a stand-up base.",
    description:
      "Catholic Advent candle craft for kids: three violet and one rose candle, flames and a fold-up base. No wreath needed. US Letter, black and white or colour.",
    seasons: ["advent"],
    keywords: ["advent candles", "craft", "violet", "rose", "gaudete", "cut and glue", "template"],
    pageSize: "US Letter",
    previews: {
      bw: "/images/activities/advent-candle-craft/preview-bw.webp",
      color: "/images/activities/advent-candle-craft/preview-color.webp",
    },
    files: { bw: "advent-candle-craft.pdf", color: "advent-candle-craft-color.pdf" },
    tryThis: [],
    prio: 50,
    access: "plus",
    seoTitle: "Advent Candle Craft Template",
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

/**
 * Which activity sheet matches the daily Instagram post (America/Toronto date). One Advent Q&A
 * "Try this" tip per day through Nov 29, 2026. Days without their own sheet show the latest
 * scheduled one; before the schedule starts, Happy New Church Year.
 */
export const DAILY_ACTIVITY_SCHEDULE: readonly { date: string; slug: string }[] = [
  { date: "2026-11-12", slug: "happy-new-church-year" },
  { date: "2026-11-13", slug: "jesse-tree-ornaments" },
  { date: "2026-11-14", slug: "prepare-the-way" },
  { date: "2026-11-15", slug: "yes-with-a-smile" },
  { date: "2026-11-16", slug: "white-flower-for-mary" },
  { date: "2026-11-17", slug: "come-lord-jesus" },
  { date: "2026-11-18", slug: "straw-for-the-manger" },
  { date: "2026-11-19", slug: "jesse-tree-picture-a-day" },
  { date: "2026-11-20", slug: "helping-hands-like-mary" },
  { date: "2026-11-21", slug: "secret-kindness-notes" },
  // Christ the King: the last Sunday of the Church year.
  { date: "2026-11-22", slug: "happy-new-church-year" },
  { date: "2026-11-23", slug: "roses-for-mary" },
  { date: "2026-11-24", slug: "o-antiphon-ornaments" },
  { date: "2026-11-25", slug: "family-advent-calendar" },
  { date: "2026-11-26", slug: "colour-the-advent-candles" },
  { date: "2026-11-27", slug: "paper-advent-wreath" },
  // The eve of the new Church year.
  { date: "2026-11-28", slug: "happy-new-church-year" },
  // First Sunday of Advent.
  { date: "2026-11-29", slug: "light-the-advent-candle" },
];

export const DEFAULT_DAILY_ACTIVITY = "happy-new-church-year";
/** The one craft shown in the This Sunday "Crafts" slot (Plus download). */
export const SUNDAY_CRAFT_SLUG = "advent-candle-craft";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD in America/Toronto (the Instagram posting time zone). */
export function torontoDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** The scheduled activity for a Toronto date, falling back to the latest earlier one with a sheet. */
export function dailyActivityFor(ymd: string): { activity: ResourceActivity; date: string | null; exact: boolean } {
  const fallback = getActivity(DEFAULT_DAILY_ACTIVITY)!;
  if (!YMD.test(ymd)) return { activity: fallback, date: null, exact: false };
  let best: { activity: ResourceActivity; date: string } | null = null;
  for (const row of DAILY_ACTIVITY_SCHEDULE) {
    if (row.date > ymd) continue;
    const activity = getActivity(row.slug);
    if (activity && (!best || row.date >= best.date)) best = { activity, date: row.date };
  }
  return best ? { ...best, exact: best.date === ymd } : { activity: fallback, date: null, exact: false };
}

export type HomeActivityPick = {
  activity: ResourceActivity;
  /** Small orange label line on the home card: truthful kind and access ("Activity · Free"). */
  label: string;
  /** "plus" shows the PLUS badge. */
  access: ActivityAccess;
};

/** How many activity / craft cards the home "Activities & crafts" row shows. */
export const HOME_ACTIVITY_PICKS = 4;

/**
 * Home "Activities & crafts" row for a Toronto date: today's scheduled sheet, the next two
 * scheduled sheets (other free Advent sheets fill in after the schedule ends), then the Plus
 * craft. Pure and deterministic for a date, so the ISR home page renders it like its other
 * date-rule slots (no request data).
 */
export function homeActivityPicks(ymd: string): HomeActivityPick[] {
  const today = dailyActivityFor(ymd).activity;
  const craft = getActivity(SUNDAY_CRAFT_SLUG);
  const freeSlots = HOME_ACTIVITY_PICKS - (craft ? 1 : 0);
  const free: ResourceActivity[] = [today];
  const add = (a: ResourceActivity | null) => {
    if (a && a.access === "signin" && free.length < freeSlots && !free.some((f) => f.slug === a.slug)) free.push(a);
  };
  for (const row of DAILY_ACTIVITY_SCHEDULE) if (YMD.test(ymd) && row.date > ymd) add(getActivity(row.slug));
  for (const a of listActivities("advent")) add(a);
  const picks: HomeActivityPick[] = free.map((activity, i) => ({
    activity,
    label: i === 0 ? "Today · Free" : "Activity · Free",
    access: activity.access,
  }));
  if (craft) picks.push({ activity: craft, label: `${craft.kind} · Plus`, access: craft.access });
  return picks;
}
