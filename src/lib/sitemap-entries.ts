import { fetchBibleBooks } from "@/lib/bible/latinprayer";
import { LITURGY_TOPICS } from "@/lib/liturgy-topics";
import { PLAY_GAMES } from "@/lib/play-games";
import { prisma } from "@/lib/prisma";
import { keyToSlug } from "@/lib/resource/sheets";
import { getSiteUrl } from "@/lib/site-url";
import { listSundaySheetKeys } from "@/lib/sunday-sheet-content";
import type { MetadataRoute } from "next";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Stable lastmod for code-defined pages. Bump this when page content changes
 * meaningfully, and never use request time, which makes Google ignore lastmod.
 */
export const SITEMAP_CONTENT_DATE = new Date("2026-10-23T00:00:00.000Z");

/** Child sitemaps listed by the /sitemap.xml index. */
export const CHILD_SITEMAP_PATHS = ["/sitemaps/pages/sitemap.xml", "/sitemaps/bible/sitemap.xml"] as const;

/**
 * Play slugs that are canonical aliases of another page (same as /play/[slug] canonicalForPath).
 * The target page is listed instead.
 */
const PLAY_ALIAS_SLUGS = new Set(["emoji"]);

/** Indexable public pages that are not generated from data. Excluded on purpose: /gospel (alias of /bible/gospel), /gallery, /newsletter, /unsubscribe and /subscribe/success (noindex), /account/*, /reader/*, /admin/*, /api/* and /print/*. */
const STATIC_PAGES: Array<[path: string, changeFrequency: SitemapEntry["changeFrequency"], priority: number]> = [
  ["/", "weekly", 1],
  ["/mass", "daily", 0.95],
  ["/daily-mass", "daily", 0.95],
  ["/resource", "weekly", 0.9],
  ["/bible/gospel", "daily", 0.9],
  ["/bible/old-testament", "monthly", 0.8],
  ["/bible/new-testament", "monthly", 0.8],
  ["/recommendations", "weekly", 0.8],
  ["/play", "weekly", 0.75],
  ["/prayers", "monthly", 0.75],
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

/** One indexable page per Sunday/feast sheet key (188, static data). */
function resourceEntries(): SitemapEntry[] {
  return listSundaySheetKeys().map((key) => entry(`/resource/${keyToSlug(key)}`, "yearly", 0.7));
}

function liturgyEntries(): SitemapEntry[] {
  return LITURGY_TOPICS.map((topic) => entry(`/liturgy/${topic}`, "weekly", 0.75));
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
    ...playEntries(),
    ...liturgyEntries(),
    ...resourceEntries(),
    ...bookHubs,
    ...recommendations,
  ];
}

/** Bible chapter reading pages: /bible/read/<book>/<chapter> for every chapter. */
export async function buildBibleChaptersSitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await bibleBooksOrEmpty("bible");
  const out: MetadataRoute.Sitemap = [];
  for (const book of [...books].sort((a, b) => a.order - b.order)) {
    for (let ch = 1; ch <= book.totalChapters; ch++) {
      out.push(entry(`/bible/read/${book.slug}/${ch}`, "yearly", 0.4));
    }
  }
  return out;
}
