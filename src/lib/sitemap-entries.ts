import { readPagePaths } from "@/lib/bible/chapter-pages";
import { fetchBibleBooks } from "@/lib/bible/latinprayer";
import { bibleVerseMomentPaths } from "@/data/moms-bible/situation-seo";
import { LITURGY_TOPICS } from "@/lib/liturgy-topics";
import { PLAY_GAMES } from "@/lib/play-games";
import { prisma } from "@/lib/prisma";
import { RESOURCE_SEASONS, seasonPath } from "@/lib/resource/sheets";
import { SAINTS_HUB, SAINT_SEO_CARDS } from "@/lib/seo/card-seo";
import { EVERGREEN_PAGES, MASS_FOR_KIDS_HUB, publicPath, VIRTUE_CHALLENGE_HUB } from "@/lib/seo/evergreen-worksheets";
import { SUNDAY_MASS_WORKSHEETS_HUB, sundayMassWorksheetPath } from "@/lib/seo/sunday-mass-worksheets";
import { getSiteUrl } from "@/lib/site-url";
import { listSundaySheetKeys } from "@/lib/sunday-sheet-content";
import type { MetadataRoute } from "next";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Stable lastmod for code-defined pages. Bump this when page content changes
 * meaningfully, and never use request time, which makes Google ignore lastmod.
 */
export const SITEMAP_CONTENT_DATE = new Date("2026-11-06T00:00:00.000Z");

/** Child sitemaps listed by the /sitemap.xml index. */
export const CHILD_SITEMAP_PATHS = [
  "/sitemaps/pages/sitemap.xml",
  "/sitemaps/resources/sitemap.xml",
  "/sitemaps/bible/sitemap.xml",
] as const;

/**
 * Play slugs that are canonical aliases of another page (same as /play/[slug] canonicalForPath).
 * The target page is listed instead.
 */
const PLAY_ALIAS_SLUGS = new Set(["emoji"]);

/** Indexable public pages that are not generated from data. Excluded on purpose: /gospel (redirects to /daily-mass), /gallery, /newsletter, /unsubscribe and /subscribe/success (noindex), /account/*, /reader/*, /admin/*, /api/* and /print/*. */
const STATIC_PAGES: Array<[path: string, changeFrequency: SitemapEntry["changeFrequency"], priority: number]> = [
  ["/", "weekly", 1],
  ["/mass", "daily", 0.95],
  ["/daily-mass", "daily", 0.95],
  ["/resource", "weekly", 0.9],
  [SUNDAY_MASS_WORKSHEETS_HUB, "weekly", 0.9],
  [MASS_FOR_KIDS_HUB, "monthly", 0.85],
  [VIRTUE_CHALLENGE_HUB, "monthly", 0.85],
  ["/resources", "weekly", 0.85],
  ["/bible-verses-for-kids", "weekly", 0.85],
  [SAINTS_HUB, "weekly", 0.85],
  ["/recommendations", "weekly", 0.8],
  ["/play", "weekly", 0.75],
  ["/prayers", "monthly", 0.75],
  ["/qa-cards", "monthly", 0.75],
  ["/mass/participation", "monthly", 0.7],
  ["/about", "yearly", 0.5],
  ["/subscribe", "monthly", 0.5],
  ["/privacy", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
  ["/affiliate-disclosure", "yearly", 0.3],
];

/** Play routes that have their own page folder rather than /play/[slug]. */
const STATIC_PLAY_PAGES = ["/play/photo-booth"];

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function entry(
  path: string,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number,
  lastModified: Date = SITEMAP_CONTENT_DATE,
): SitemapEntry {
  return { url: absoluteUrl(path), lastModified, changeFrequency, priority };
}

function playEntries(): SitemapEntry[] {
  const paths = new Set<string>(STATIC_PLAY_PAGES);
  for (const game of PLAY_GAMES) {
    if (!PLAY_ALIAS_SLUGS.has(game.slug)) paths.add(`/play/${game.slug}`);
  }
  return [...paths].map((p) => entry(p, "weekly", 0.7));
}

/** Season hubs + Sunday worksheet SEO pages + evergreen Mass/virtue worksheet pages (Advent prioritized). /resource/[slug] weeks are not listed. */
export function buildResourcesSitemap(): MetadataRoute.Sitemap {
  const weeks = listSundaySheetKeys().map((key) => {
    const isAdvent = key.includes("_ADV");
    return entry(sundayMassWorksheetPath(key), "weekly", isAdvent ? 0.95 : 0.8);
  });
  const seasons = RESOURCE_SEASONS.map((s) =>
    entry(seasonPath(s.id), "monthly", s.id === "advent" ? 0.95 : 0.85),
  );
  const evergreen = EVERGREEN_PAGES.map((p) => entry(publicPath(p), "monthly", 0.75));
  return [...seasons, ...weeks, ...evergreen];
}

function liturgyEntries(): SitemapEntry[] {
  return LITURGY_TOPICS.map((topic) => entry(`/liturgy/${topic}`, "weekly", 0.75));
}

function bibleVersesForKidsEntries(): SitemapEntry[] {
  return bibleVerseMomentPaths().map((path) => entry(path, "monthly", 0.7));
}

function saintCardEntries(): SitemapEntry[] {
  return SAINT_SEO_CARDS.map((c) => entry(`${SAINTS_HUB}/${c.slug}`, "monthly", 0.65));
}

async function recommendationEntries(): Promise<SitemapEntry[]> {
  try {
    const rows = await prisma.recommendation.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    });
    console.info(`[sitemap] recommendations: ${rows.length} published URLs added`);
    return rows.map((r) => entry(`/recommendations/${r.slug}`, "monthly", 0.6, r.updatedAt));
  } catch (e) {
    console.error(
      "[sitemap] recommendations: database query failed, /recommendations/<slug> URLs skipped (static pages still served):",
      e instanceof Error ? e.message : e,
    );
    return [];
  }
}

async function bibleBooksOrEmpty(context: string) {
  try {
    return await fetchBibleBooks();
  } catch (e) {
    console.error(
      `[sitemap] ${context}: Bible book list failed to load, Bible URLs skipped:`,
      e instanceof Error ? e.message : e,
    );
    return [];
  }
}

/** Main pages sitemap: static pages, play, liturgy topics, Bible book hubs, recommendations. */
export async function buildPagesSitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, recommendations] = await Promise.all([
    bibleBooksOrEmpty("pages"),
    recommendationEntries(),
  ]);
  const bookHubs = [...books]
    .sort((a, b) => a.order - b.order)
    .map((b) => entry(`/bible/${b.slug}`, "monthly", 0.6));

  return [
    ...STATIC_PAGES.map(([p, f, pr]) => entry(p, f, pr)),
    ...bibleVersesForKidsEntries(),
    ...saintCardEntries(),
    ...playEntries(),
    ...liturgyEntries(),
    ...bookHubs,
    ...recommendations,
  ];
}

/**
 * Bible chapter reading pages: /bible/read/<book>/<chapter> for every page, numbered the
 * official Catholic way (chapters that redirect into another page, like Psalm 10, are skipped).
 */
export async function buildBibleChaptersSitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await bibleBooksOrEmpty("bible");
  const out: MetadataRoute.Sitemap = [];
  for (const book of [...books].sort((a, b) => a.order - b.order)) {
    const paths = readPagePaths(book.slug);
    if (paths.length > 0) {
      for (const path of paths) out.push(entry(path, "yearly", 0.4));
      continue;
    }
    for (let ch = 1; ch <= book.totalChapters; ch++) {
      out.push(entry(`/bible/read/${book.slug}/${ch}`, "yearly", 0.4));
    }
  }
  return out;
}
