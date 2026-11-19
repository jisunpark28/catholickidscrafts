// Printable activities (coloring sheets, make-at-home pages) in the Resource library.
// DB-free and client-safe: the catalog holds only public data. Editor-backed sheet PDFs live in
// assets/activities and ready-made craft PDFs in the private Vercel Blob store (never public);
// both are served only by the signed-in download route.
import type { ResourceSeason } from "@/lib/resource/sheets";
import { adventStart, easterSunday, getLiturgicalSeason } from "@/lib/liturgical-season";
import { weekSundayOf } from "@/lib/resource/week";
import { PRAYER_SHEET_ROWS, type PrayerSheetLevel, type PrayerSheetRow } from "@/lib/resource/prayer-sheet-list";

export type ActivityVariant = "bw" | "color";
/**
 * Catalog gate. "plus": Plus members only. "signin": Plus too, except in a week the sheet is the
 * day's activity on some day (dailyActivityFor: DAILY_ACTIVITY_SCHEDULE, then the year-round
 * recurringActivitySlug rule), when any signed-in family can download it (isActivityFreeThisWeek).
 * The download API checks this on every request.
 */
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
  /** "signin": free with sign-in only in its scheduled week, else Plus. "plus": always Plus (see ActivityAccess). */
  access: ActivityAccess;
  /** Page <title> (without the site name). */
  seoTitle: string;
  /** Has an editable element model (the Plus editor). Ready-made craft PDFs (artwork) do not. */
  editable: boolean;
  /** Where the PDFs are: bundled under assets/activities, or the private Blob store (server-only paths in craft-blobs.ts). */
  storage: "bundle" | "blob";
};

export const ACTIVITY_PATH = "/resource/activity";
/** Saint Report Worksheet (linked from the saints hub and each saint page). */
export const SAINT_REPORT_SLUG = "saint-report-worksheet";

type DailyRow = [slug: string, title: string, kind: string, tryThis: string, summary: string, keywords: string[]];

/** Daily Advent sheets: one per Q&A card "Try this" tip, free with sign-in in the week they are scheduled. */
function DAILY(rows: DailyRow[]): ResourceActivity[] {
  return rows.map(([slug, title, kind, tryThis, summary, keywords], i) => ({
    slug,
    title,
    kind,
    summary,
    description: `Catholic Advent ${kind.toLowerCase()} for kids: ${summary.charAt(0).toLowerCase()}${summary.slice(1)} US Letter, black and white or colour.`,
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
    editable: true,
    storage: "bundle",
  }));
}

type CraftRow = [slug: string, title: string, summary: string, seasons: ResourceSeason[], pages: number, keywords: string[]];

const SEASON_WORD: Partial<Record<ResourceSeason, string>> = { advent: "Advent", christmas: "Christmas", easter: "Easter" };

/**
 * Ready-made Plus crafts (artwork PDFs, imported by scripts/activities/crafts/import_crafts.py).
 * Titles and summaries come from each PDF's own first page. No editor model.
 */
function CRAFTS(rows: CraftRow[]): ResourceActivity[] {
  return rows.map(([slug, title, summary, seasons, pages, keywords], i) => ({
    slug,
    title,
    kind: "Craft",
    summary,
    description: `Catholic ${SEASON_WORD[seasons[0]!] ?? ""} craft for kids: ${summary.charAt(0).toLowerCase()}${summary.slice(1)} ${pages}-page US Letter template, black and white or colour.`.replace("Catholic  ", "Catholic "),
    seasons,
    keywords: [...keywords, "craft", "cut and glue", "template", "printable"],
    pageSize: "US Letter",
    previews: {
      bw: `/images/activities/${slug}/preview-bw.webp`,
      color: `/images/activities/${slug}/preview-color.webp`,
    },
    files: { bw: `${slug}.pdf`, color: `${slug}-color.pdf` },
    tryThis: [],
    prio: 51 + i,
    access: "plus",
    seoTitle: `${title} Craft Template`,
    editable: false,
    storage: "blob",
  }));
}

const PRAYER_LEVEL_COPY: Record<PrayerSheetLevel, { name: string; how: string; keywords: string[] }> = {
  little: { name: "Little", how: "circle the missing word in each line, choosing from three words", keywords: ["missing word", "circle"] },
  growing: { name: "Growing", how: "fill in the missing words of each line, with a word bank", keywords: ["fill in the blanks", "word bank"] },
  ready: { name: "Ready", how: "write each line of the prayer from a short clue, with first-letter hints", keywords: ["copywork", "handwriting", "memorize"] },
};

/**
 * Prayer worksheets for the /prayers carousel (Little / Growing / Ready, one page each; long prayers
 * in parts). Built by scripts/activities/prayers. Always Plus: never in the daily schedule.
 */
/** Tile label of the prayer worksheets. */
export const PRAYER_WORKSHEET_KIND = "Prayer worksheet";

function PRAYER_SHEETS(rows: readonly PrayerSheetRow[]): ResourceActivity[] {
  return rows.map(([slug, prayer, prayerTitle, level, part, parts], i) => {
    const copy = PRAYER_LEVEL_COPY[level];
    const partLabel = parts > 1 ? ` (Part ${part} of ${parts})` : "";
    const title = `${prayerTitle}: ${copy.name} Worksheet${partLabel}`;
    return {
      slug,
      title,
      kind: PRAYER_WORKSHEET_KIND,
      summary: `${prayerTitle}${partLabel}: ${copy.how}.`,
      description: `Catholic prayer worksheet for kids: learn the ${prayerTitle}${partLabel} line by line. ${copy.name}: ${copy.how}. US Letter, black and white or colour.`,
      seasons: [],
      keywords: [prayer.replace(/-/g, " "), "prayer", "prayers", "catholic prayers", "learn prayers", copy.name.toLowerCase(), ...copy.keywords, "worksheet", "printable"],
      pageSize: "US Letter",
      previews: {
        bw: `/images/activities/${slug}/preview-bw.webp`,
        color: `/images/activities/${slug}/preview-color.webp`,
      },
      files: { bw: `${slug}.pdf`, color: `${slug}-color.pdf` },
      tryThis: [],
      prio: 200 + i,
      access: "plus",
      seoTitle: `${title} (Printable)`,
      editable: true,
      storage: "bundle",
    };
  });
}

export const RESOURCE_ACTIVITIES: readonly ResourceActivity[] = [
  {
    slug: "happy-new-church-year",
    title: "Happy New Church Year",
    kind: "Coloring sheet",
    summary: "Colour the seasons of the Church year on one simple wheel, starting with Advent.",
    description:
      "Catholic coloring sheet for kids: colour the liturgical year wheel from Advent to Ordinary Time. US Letter, black and white or colour.",
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
    editable: true,
    storage: "bundle",
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
    editable: true,
    storage: "bundle",
  },
  {
    slug: SAINT_REPORT_SLUG,
    title: "Saint Report Worksheet",
    kind: "Worksheet",
    summary:
      "Research a saint: feast day, patron, symbols, where and when they lived, how they loved God, one way to follow their example, and a space to draw.",
    description:
      "Catholic saint report worksheet for kids: feast day, patron, symbols, how the saint loved God and a box to draw. US Letter, black and white or colour.",
    seasons: ["feasts"],
    keywords: [
      "saint",
      "saints",
      "saint report",
      "saint research project",
      "patron saint",
      "feast day",
      "symbols",
      "confirmation saint",
      "all saints",
      "worksheet",
      "printable",
      "activity",
    ],
    pageSize: "US Letter",
    previews: {
      bw: "/images/activities/saint-report-worksheet/preview-bw.webp",
      color: "/images/activities/saint-report-worksheet/preview-color.webp",
    },
    files: { bw: "saint-report-worksheet.pdf", color: "saint-report-worksheet-color.pdf" },
    tryThis: [],
    prio: 40,
    access: "plus",
    seoTitle: "Saint Report Worksheet for Kids (Printable)",
    editable: true,
    storage: "bundle",
  },
  ...CRAFTS([
    ["advent-bank", "Advent Charity Bank",
      "A little stable bank for Advent alms. Each coin is a gift for Jesus; at Christmas, give it to the poor through your parish or a Catholic charity.",
      ["advent"], 2, ["almsgiving", "charity", "coin bank", "stable", "cheerful giver", "2 corinthians 9:7"]],
    ["advent-lantern", "Advent Candle Lantern",
      "A glowing six-sided paper lantern for a battery LED tea light (never a real flame).",
      ["advent"], 2, ["lantern", "candle", "tea light", "light in the darkness", "john 1:5"]],
    ["fiat-flag", "The Fiat Flag",
      "Mary's yes, on a flag to carry: \"May it be done to me according to your word.\"",
      ["advent"], 2, ["fiat", "mary", "annunciation", "flag", "luke 1:38"]],
    ["gabriel-wings", "Angel Gabriel Wings",
      "Wear Gabriel's wings and lily headband. You need 2 ribbons or elastic, 60 cm each.",
      ["advent"], 3, ["angel gabriel", "wings", "headband", "lily", "annunciation", "luke 1:31", "costume"]],
    ["joseph-lily", "St. Joseph's Lily",
      "Fold St. Joseph's flowering lily, a traditional sign of his purity.",
      ["advent", "feasts"], 2, ["st joseph", "saint joseph", "lily", "flower", "paper flower"]],
    ["birthday-card", "Happy Birthday, Jesus!",
      "A pop-up birthday card for the Baby in the manger, with a space to write your gift for Jesus.",
      ["christmas"], 2, ["birthday card", "pop-up card", "manger", "baby jesus", "luke 2:11"]],
    ["swaddle-baby", "Baby Jesus in Swaddling Clothes",
      "\"She wrapped him in swaddling clothes and laid him in a manger\" (Luke 2:7). Glue and fold Baby Jesus.",
      ["christmas"], 2, ["baby jesus", "swaddling clothes", "manger", "nativity", "luke 2:7"]],
    ["gloria-trumpet", "The Gloria Trumpet",
      "Sing with the angels: Gloria in excelsis Deo! A roll-up trumpet with a banner.",
      ["christmas"], 2, ["gloria", "trumpet", "angels", "glory to god", "luke 2:14"]],
    ["shepherd-crook", "The Good Shepherd's Crook",
      "A shepherd's crook with a little lamb to carry home.",
      ["christmas", "easter"], 2, ["good shepherd", "shepherd", "crook", "lamb", "sheep", "john 10:11"]],
    ["bethlehem-star", "Star of Bethlehem",
      "A hanging mobile of the star that led the Magi.",
      ["christmas"], 2, ["star", "bethlehem", "magi", "mobile", "epiphany", "matthew 2:2"]],
    ["magi-gifts", "The Magi's Gifts",
      "Three little boxes for gold, frankincense and myrrh. The lids really open.",
      ["christmas"], 3, ["magi", "wise men", "gold", "frankincense", "myrrh", "gift boxes", "epiphany", "matthew 2:11"]],
    // Crafts2
    ["angel-choir", "Heavenly Choir Angels",
      "A standing hand-in-hand accordion of six singing angels: \"Glory to God in the highest\" (Luke 2:13-14).",
      ["christmas"], 2, ["angels", "choir", "accordion", "glory to god", "gloria", "luke 2:14"]],
    ["baptism-dove-mobile", "The Baptism of the Lord Mobile",
      "A hanging mobile of the Spirit descending like a dove, with drops and a shell.",
      ["christmas"], 2, ["baptism of the lord", "dove", "holy spirit", "mobile", "shell", "matthew 3:17"]],
    ["christmas-eve-lantern", "Christmas Eve Lantern",
      "A glowing Nativity lantern for Christmas night, for a battery LED tea light (never a real flame).",
      ["christmas"], 2, ["lantern", "nativity", "christmas eve", "tea light", "luke 2:11"]],
    ["emmanuel-door-hanger", "The Emmanuel Door Hanger",
      "A door hanger that says God is with us: \"they shall name him Emmanuel\" (Matthew 1:23).",
      ["advent", "christmas"], 2, ["emmanuel", "god is with us", "door hanger", "matthew 1:23"]],
    ["epiphany-chalk-blessing", "The Epiphany Chalk Blessing",
      "A blessing strip to hang above the door on Epiphany. C+M+B stands for Caspar, Melchior, Balthasar and Christus mansionem benedicat (May Christ bless this house).",
      ["christmas"], 2, ["epiphany", "chalk blessing", "house blessing", "c+m+b", "magi", "matthew 2:11"]],
    ["flight-into-egypt", "The Flight into Egypt",
      "A stand-up donkey for the Holy Family, with Mary on the saddle and Joseph beside it.",
      ["christmas"], 2, ["flight into egypt", "holy family", "donkey", "joseph", "mary", "matthew 2:14"]],
    ["heart-ornaments", "Sacred Heart & Immaculate Heart",
      "A matching pair of 3D heart ornaments to hang.",
      ["feasts"], 2, ["sacred heart", "immaculate heart", "heart", "ornament", "matthew 11:29", "luke 2:35"]],
    ["holy-family-mobile", "The Holy Family Mobile",
      "A hanging mobile of Jesus, Mary, and Joseph.",
      ["christmas"], 2, ["holy family", "mobile", "jesus", "mary", "joseph", "nazareth", "luke 2:51"]],
    ["john-the-baptist-card", "Prepare the Way: John the Baptist Card",
      "A John the Baptist standing card: \"Prepare the way of the Lord, make straight his paths.\" (Matthew 3:3)",
      ["advent"], 2, ["john the baptist", "prepare the way", "standing card", "card", "matthew 3:3"]],
    ["magi-finger-puppets", "The Magi Finger Puppets",
      "Three wise men, and the star that led them, to slip on a finger. Caspar brings gold, Melchior frankincense, and Balthasar myrrh.",
      ["christmas"], 2, ["magi", "wise men", "finger puppets", "puppets", "star", "epiphany", "matthew 2:11"]],
    ["manger-banner", "A Sign for You",
      "A manger banner: \"you will find an infant wrapped in swaddling clothes and lying in a manger\" (Luke 2:12).",
      ["christmas"], 2, ["manger", "banner", "baby jesus", "swaddling clothes", "luke 2:12"]],
    ["newborn-king-crown", "The Newborn King's Crown",
      "A white and gold crown for Christ the newborn King. Fits 48-56 cm.",
      ["christmas"], 2, ["crown", "newborn king", "christ the king", "epiphany", "matthew 2:2"]],
    ["pondering-heart", "Mary's Pondering Heart",
      "A standing 3D heart for the things Mary kept in her heart (Luke 2:19).",
      ["christmas"], 2, ["mary", "heart", "pondering", "mother of god", "luke 2:19"]],
    ["visitation-popup", "The Visitation",
      "A pop-up card of Mary and Elizabeth: \"Most blessed are you among women\" (Luke 1:42).",
      ["advent", "feasts"], 2, ["visitation", "mary", "elizabeth", "pop-up card", "luke 1:42"]],
  ]),
  ...PRAYER_SHEETS(PRAYER_SHEET_ROWS),
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

/** Worksheets of one /prayers carousel prayer, in level order. */
export function prayerSheetsFor(prayerSlug: string): { activity: ResourceActivity; level: PrayerSheetLevel; part: number; parts: number }[] {
  return PRAYER_SHEET_ROWS.filter((r) => r[1] === prayerSlug).flatMap(([slug, , , level, part, parts]) => {
    const activity = getActivity(slug);
    return activity ? [{ activity, level, part, parts }] : [];
  });
}

export function listActivities(season: ResourceSeason | null = null): ResourceActivity[] {
  return RESOURCE_ACTIVITIES.filter((a) => !season || a.seasons.includes(season))
    .slice()
    .sort((a, b) => a.prio - b.prio || a.slug.localeCompare(b.slug));
}

/** Page size for Printables Worksheets season craft/activity recommendations. */
export const SEASON_REC_PAGE_SIZE = 6;

/**
 * Crafts + activities tagged for a liturgical season (Printables Worksheets article).
 * Sorted by library prio; empty when the catalog has nothing for that season yet.
 */
export function seasonActivityRecommendations(season: ResourceSeason): ResourceActivity[] {
  return listActivities(season);
}

/**
 * Which activity sheet matches the daily Instagram post (America/Toronto date). One Advent Q&A
 * "Try this" tip per day through Christmas Eve 2026. Days without their own sheet show the latest
 * scheduled one; before the schedule starts, Happy New Church Year. Sign-in sheets only (no Plus crafts).
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
  // Advent 2026 (First Sunday → Christmas Eve).
  { date: "2026-11-29", slug: "light-the-advent-candle" },
  { date: "2026-11-30", slug: "come-lord-jesus" },
  { date: "2026-12-01", slug: "colour-the-advent-candles" },
  { date: "2026-12-02", slug: "paper-advent-wreath" },
  { date: "2026-12-03", slug: "family-advent-calendar" },
  { date: "2026-12-04", slug: "jesse-tree-ornaments" },
  { date: "2026-12-05", slug: "come-lord-jesus" },
  { date: "2026-12-06", slug: "straw-for-the-manger" },
  { date: "2026-12-07", slug: "prepare-the-way" },
  { date: "2026-12-08", slug: "white-flower-for-mary" },
  { date: "2026-12-09", slug: "straw-for-the-manger" },
  { date: "2026-12-10", slug: "helping-hands-like-mary" },
  { date: "2026-12-11", slug: "yes-with-a-smile" },
  { date: "2026-12-12", slug: "roses-for-mary" },
  { date: "2026-12-13", slug: "jesse-tree-picture-a-day" },
  { date: "2026-12-14", slug: "o-antiphon-ornaments" },
  { date: "2026-12-15", slug: "jesse-tree-picture-a-day" },
  { date: "2026-12-16", slug: "secret-kindness-notes" },
  { date: "2026-12-17", slug: "come-lord-jesus" },
  { date: "2026-12-18", slug: "straw-for-the-manger" },
  { date: "2026-12-19", slug: "jesse-tree-picture-a-day" },
  { date: "2026-12-20", slug: "jesse-tree-picture-a-day" },
  { date: "2026-12-21", slug: "white-flower-for-mary" },
  { date: "2026-12-22", slug: "jesse-tree-picture-a-day" },
  { date: "2026-12-23", slug: "light-the-advent-candle" },
  { date: "2026-12-24", slug: "straw-for-the-manger" },
];

export const DEFAULT_DAILY_ACTIVITY = "happy-new-church-year";
/** The one craft shown in the This Sunday "Crafts" slot (Plus download). */
export const SUNDAY_CRAFT_SLUG = "advent-candle-craft";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD in America/Toronto (the Instagram posting time zone). */
export function torontoDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * Lectionary cycle of the liturgical year that begins at Advent of `adventYear`
 * (Advent 2025 = A, 2026 = B, 2027 = C; same rule as sundayCycleFor).
 */
export function lectionaryCycle(adventYear: number): "A" | "B" | "C" {
  return (["A", "B", "C"] as const)[((adventYear % 3) + 3) % 3]!;
}

/**
 * Fixed dates on the General Roman Calendar that one of the sign-in sheets is about (MM-DD).
 * The Annunciation (March 25) is not here: it moves in some years (annunciationDate).
 * A Sunday of Advent takes precedence; the Immaculate Conception then moves to Monday, December 9.
 */
export const ACTIVITY_FIXED_FEASTS: Readonly<Record<string, string>> = {
  "01-01": "yes-with-a-smile", // Mary, the Holy Mother of God
  "05-31": "helping-hands-like-mary", // The Visitation of the Blessed Virgin Mary
  "06-24": "prepare-the-way", // The Nativity of Saint John the Baptist
  "12-06": "secret-kindness-notes", // Saint Nicholas
  "12-08": "white-flower-for-mary", // The Immaculate Conception
  "12-12": "roses-for-mary", // Our Lady of Guadalupe
};

/** Sheet for the Solemnity of the Annunciation of the Lord (Mary's yes, Lk 1:38). */
export const ANNUNCIATION_SHEET = "yes-with-a-smile";

/**
 * Date (YYYY-MM-DD) of the Solemnity of the Annunciation of the Lord in a year, per the Universal
 * Norms on the Liturgical Year and the Calendar, no. 60: March 25, but when it falls in Holy Week
 * (Palm Sunday to Holy Saturday) it is always moved to the Monday after the Second Sunday of Easter
 * (2027: Monday, April 5). In the Easter Octave it moves to that same Monday, the closest day
 * outside the Octave. On a Sunday of Lent it moves to the next day, Monday, March 26.
 */
export function annunciationDate(year: number): string {
  const easter = easterSunday(year).getTime();
  const march25 = Date.UTC(year, 2, 25);
  let t = march25;
  if (march25 >= easter - 7 * DAY_MS && march25 <= easter + 7 * DAY_MS) t = easter + 8 * DAY_MS;
  else if (new Date(march25).getUTCDay() === 0) t = march25 + DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

/** Advent weekdays (Monday to Saturday) by Advent week, rotating through the list. */
const ADVENT_WEEKDAY_SHEETS: readonly (readonly string[])[] = [
  // Week 1: the Lord's coming; the week leads to John the Baptist (Second Sunday, every cycle).
  ["paper-advent-wreath", "come-lord-jesus", "jesse-tree-ornaments", "prepare-the-way"],
  // Week 2: leads to Gaudete Sunday (the rose candle).
  ["colour-the-advent-candles", "jesse-tree-picture-a-day", "secret-kindness-notes", "straw-for-the-manger"],
  // Week 3: leads to the Fourth Sunday.
  ["jesse-tree-picture-a-day", "straw-for-the-manger", "come-lord-jesus"],
];

/**
 * Fourth Sunday of Advent: the sheet for that Sunday's Gospel in each cycle. It is free in the week
 * that ends on that Sunday (the same week as its Sunday sheet). A: Joseph's dream (Mt 1:18-24),
 * B: the Annunciation (Lk 1:26-38), C: the Visitation (Lk 1:39-45).
 */
export const ADVENT4_SUNDAY_SHEET: Readonly<Record<"A" | "B" | "C", string>> = {
  A: "straw-for-the-manger",
  B: "yes-with-a-smile",
  C: "helping-hands-like-mary",
};

/** Outside Advent: one sheet per week (Monday to Sunday), rotating through the season's list. */
export const ACTIVITY_SEASON_WEEKLY: Readonly<Record<"christmas" | "lent" | "easter" | "ordinary", readonly string[]>> = {
  christmas: ["helping-hands-like-mary", "yes-with-a-smile"],
  lent: ["prepare-the-way", "secret-kindness-notes", "helping-hands-like-mary"],
  easter: ["helping-hands-like-mary", "yes-with-a-smile", "secret-kindness-notes"],
  ordinary: ["secret-kindness-notes", "helping-hands-like-mary", "yes-with-a-smile"],
};

/** Week 0 of the weekly rotation (a Sunday). */
const ROTATION_EPOCH_SUNDAY = "2026-11-22";
const DAY_MS = 86_400_000;

/**
 * Year-round daily activity for a date outside DAILY_ACTIVITY_SCHEDULE, from the liturgical
 * calendar (pure, every year): fixed feasts above; Advent Sundays light the wreath, with the
 * Fourth Sunday following the cycle's Gospel; the O Antiphons December 17 to 23; Christmas Eve the
 * manger; Advent weekdays by week; Christ the King week (the last week before Advent) the
 * Happy New Church Year wheel; otherwise one sheet a week from the season's list.
 */
export function recurringActivitySlug(ymd: string): string | null {
  if (!YMD.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  const season = getLiturgicalSeason(date).name;
  const md = ymd.slice(5);
  const dow = date.getUTCDay();
  const feast = ACTIVITY_FIXED_FEASTS[md];
  if (ymd === annunciationDate(y)) return ANNUNCIATION_SHEET;
  const adventSunday = season === "Advent" && dow === 0;
  if (feast && !adventSunday) return feast;
  if (md === "12-09" && dow === 1) return "white-flower-for-mary"; // December 8 was a Sunday of Advent

  const advent = adventStart(y).getTime();
  if (season === "Advent") {
    const week = Math.floor((date.getTime() - advent) / (7 * DAY_MS)) + 1;
    if (dow === 0) return week === 4 ? ADVENT4_SUNDAY_SHEET[lectionaryCycle(y)] : "light-the-advent-candle";
    if (md === "12-24") return "straw-for-the-manger";
    if (md >= "12-17") return "o-antiphon-ornaments";
    const list = ADVENT_WEEKDAY_SHEETS[Math.min(week, 3) - 1]!;
    return list[(dow - 1) % list.length]!;
  }
  if (date.getTime() >= advent - 7 * DAY_MS && date.getTime() < advent) return "happy-new-church-year";

  const pool =
    season === "Christmas Season"
      ? ACTIVITY_SEASON_WEEKLY.christmas
      : season === "Lent" || season === "Holy Week"
        ? ACTIVITY_SEASON_WEEKLY.lent
        : season.startsWith("Easter")
          ? ACTIVITY_SEASON_WEEKLY.easter
          : ACTIVITY_SEASON_WEEKLY.ordinary;
  const weekIndex = Math.round((Date.parse(`${weekSundayOf(ymd)}T00:00:00Z`) - Date.parse(`${ROTATION_EPOCH_SUNDAY}T00:00:00Z`)) / (7 * DAY_MS));
  return pool[((weekIndex % pool.length) + pool.length) % pool.length]!;
}

/**
 * The activity for a Toronto date: DAILY_ACTIVITY_SCHEDULE inside its range (falling back to the
 * latest earlier row), and the year-round recurringActivitySlug rule before and after it.
 */
export function dailyActivityFor(ymd: string): { activity: ResourceActivity; date: string | null; exact: boolean } {
  const fallback = getActivity(DEFAULT_DAILY_ACTIVITY)!;
  if (!YMD.test(ymd)) return { activity: fallback, date: null, exact: false };
  const first = DAILY_ACTIVITY_SCHEDULE[0]?.date ?? "";
  const last = DAILY_ACTIVITY_SCHEDULE.at(-1)?.date ?? "";
  if (ymd < first || ymd > last) {
    const recurring = getActivity(recurringActivitySlug(ymd));
    if (recurring) return { activity: recurring, date: ymd, exact: true };
  }
  let best: { activity: ResourceActivity; date: string } | null = null;
  for (const row of DAILY_ACTIVITY_SCHEDULE) {
    if (row.date > ymd) continue;
    const activity = getActivity(row.slug);
    if (activity && (!best || row.date >= best.date)) best = { activity, date: row.date };
  }
  return best ? { ...best, exact: best.date === ymd } : { activity: fallback, date: null, exact: false };
}

/** The seven Toronto dates (Monday to Sunday) of the week that ends on weekSundayOf(ymd). */
export function weekDatesOf(ymd: string): string[] {
  const sunday = Date.parse(`${weekSundayOf(ymd)}T00:00:00Z`);
  return [6, 5, 4, 3, 2, 1, 0].map((i) => new Date(sunday - i * DAY_MS).toISOString().slice(0, 10));
}

/**
 * Free with sign-in in the week of a Toronto date: a "signin" sheet that is the daily activity
 * (dailyActivityFor) on any day of that week. Weeks run Monday to Sunday and end on "This Sunday"
 * (weekSundayOf, the Sunday sheet rule). Everything else, including "plus" sheets, is Plus only.
 */
export function isActivityFreeInWeekOf(activity: Pick<ResourceActivity, "slug" | "access">, ymd: string): boolean {
  if (activity.access !== "signin" || !YMD.test(ymd)) return false;
  return weekDatesOf(ymd).some((day) => dailyActivityFor(day).activity.slug === activity.slug);
}

/** isActivityFreeInWeekOf for the current Toronto date (per request / per render). */
export function isActivityFreeThisWeek(activity: Pick<ResourceActivity, "slug" | "access">, now: Date = new Date()): boolean {
  return isActivityFreeInWeekOf(activity, torontoDate(now));
}

/** The gate that applies in the week of a Toronto date: "signin" (free this week) or "plus". */
export function activityAccessInWeekOf(activity: Pick<ResourceActivity, "slug" | "access">, ymd: string): ActivityAccess {
  return isActivityFreeInWeekOf(activity, ymd) ? "signin" : "plus";
}

/** activityAccessInWeekOf for the current Toronto date. */
export function activityAccessNow(activity: Pick<ResourceActivity, "slug" | "access">, now: Date = new Date()): ActivityAccess {
  return activityAccessInWeekOf(activity, torontoDate(now));
}

export type HomeActivityPick = {
  activity: ResourceActivity;
  /** Small orange label line on the home card: truthful kind and access this week ("Activity · Free"). */
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
  const picks: HomeActivityPick[] = free.map((activity, i) => {
    // Free only when the sheet is scheduled in this week; otherwise it is labelled Plus.
    const access = activityAccessInWeekOf(activity, ymd);
    return { activity, label: `${i === 0 ? "Today" : "Activity"} · ${access === "plus" ? "Plus" : "Free"}`, access };
  });
  if (craft) picks.push({ activity: craft, label: `${craft.kind} · Plus`, access: craft.access });
  return picks;
}

/** How many cards the home "Crafts" row shows. */
export const HOME_CRAFT_PICKS = 4;
/** Library search that lists the crafts ("See all"). */
export const CRAFTS_LIST_PATH = "/resource?view=all&q=craft";

/**
 * Home "Crafts" row: the Plus crafts for a season first (prio order), then the others. The Advent
 * Candle Craft is left out because the "Activities & crafts" row above already shows it. Pure for a
 * season, so the ISR home page renders it like its other date-rule slots.
 */
export function homeCraftPicks(season: ResourceSeason | null): ResourceActivity[] {
  const crafts = listActivities().filter((a) => a.kind === "Craft" && a.slug !== SUNDAY_CRAFT_SLUG);
  const inSeason = season ? crafts.filter((a) => a.seasons.includes(season)) : [];
  return [...inSeason, ...crafts.filter((a) => !inSeason.includes(a))].slice(0, HOME_CRAFT_PICKS);
}
