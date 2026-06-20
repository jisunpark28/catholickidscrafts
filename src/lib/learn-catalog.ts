import { getPublishedHomeSections } from "@/lib/home-sections";
import { fetchBibleBooks } from "@/lib/bible/latinprayer";
import { getPlayGamesFromCopy } from "@/lib/play-games-copy";
import { prisma } from "@/lib/prisma";
import { getSiteCopyMap } from "@/lib/site-copy";
import type { Prisma } from "@prisma/client";

export type LearnSearchKind =
  | "resource"
  | "curriculum"
  | "game"
  | "bible"
  | "home";

export type LearnSearchResult = {
  id: string;
  kind: LearnSearchKind;
  title: string;
  excerpt: string;
  href: string;
  badge: string;
};

const MAX_PER_KIND = 8;
const MAX_TOTAL = 24;

function playGameHref(slug: string): string {
  if (slug === "emoji") return "/play/photo-booth";
  return `/play/${slug}`;
}

function scoreMatch(query: string, ...fields: string[]): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const field of fields) {
    const f = field.toLowerCase();
    if (!f) continue;
    if (f === q) score += 100;
    else if (f.startsWith(q)) score += 50;
    else if (f.includes(q)) score += 20;
  }
  return score;
}

function takeTop<T extends { score: number }>(rows: T[], limit: number): T[] {
  return rows.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function searchLearnCatalog(query: string): Promise<LearnSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const copy = await getSiteCopyMap();
  const results: (LearnSearchResult & { score: number })[] = [];

  const resourceWhere: Prisma.ResourceWhereInput = {
    published: true,
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { grade: { contains: q, mode: "insensitive" } },
      { topic: { contains: q, mode: "insensitive" } },
    ],
  };

  const [resources, tracks, sections, books] = await Promise.all([
    prisma.resource.findMany({
      where: resourceWhere,
      take: MAX_PER_KIND,
      orderBy: { updatedAt: "desc" },
      select: { slug: true, title: true, excerpt: true, grade: true, topic: true },
    }),
    prisma.curriculumTrack.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { stage: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      take: MAX_PER_KIND,
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, description: true, stage: true },
    }),
    getPublishedHomeSections(),
    fetchBibleBooks().catch(() => []),
  ]);

  for (const r of resources) {
    results.push({
      id: `resource-${r.slug}`,
      kind: "resource",
      title: r.title,
      excerpt: r.excerpt,
      href: `/resources/${r.slug}`,
      badge: "Kids Resource",
      score: scoreMatch(q, r.title, r.excerpt, r.grade, r.topic),
    });
  }

  for (const t of tracks) {
    results.push({
      id: `curriculum-${t.slug}`,
      kind: "curriculum",
      title: t.title,
      excerpt: t.description,
      href: `/curriculum/${t.slug}`,
      badge: t.stage,
      score: scoreMatch(q, t.title, t.description, t.stage),
    });
  }

  for (const game of getPlayGamesFromCopy(copy)) {
    const score = scoreMatch(q, game.title, game.description, game.slug);
    if (score <= 0) continue;
    results.push({
      id: `game-${game.slug}`,
      kind: "game",
      title: game.title,
      excerpt: game.description,
      href: playGameHref(game.slug),
      badge: "Play",
      score,
    });
  }

  for (const section of sections) {
    for (const item of section.items) {
      const score = scoreMatch(q, item.title, section.title, item.href);
      if (score <= 0) continue;
      results.push({
        id: `home-${item.id}`,
        kind: "home",
        title: item.title,
        excerpt: section.title,
        href: item.href,
        badge: "Home",
        score,
      });
    }
  }

  const bibleStatic = [
    { title: "Today's Gospel", excerpt: "Bible reading", href: "/gospel" },
    { title: "Old Testament", excerpt: "73-book Catholic Bible", href: "/bible/old-testament" },
    { title: "New Testament", excerpt: "73-book Catholic Bible", href: "/bible/new-testament" },
  ];
  for (const entry of bibleStatic) {
    const score = scoreMatch(q, entry.title, entry.excerpt);
    if (score <= 0) continue;
    results.push({
      id: `bible-${entry.href}`,
      kind: "bible",
      title: entry.title,
      excerpt: entry.excerpt,
      href: entry.href,
      badge: "Bible",
      score,
    });
  }

  for (const book of books) {
    const score = scoreMatch(q, book.name, book.slug, book.testament);
    if (score <= 0) continue;
    results.push({
      id: `bible-${book.slug}`,
      kind: "bible",
      title: book.name,
      excerpt: `${book.testament === "OT" ? "Old" : "New"} Testament · ${book.totalChapters} chapters`,
      href: `/bible/${book.slug}`,
      badge: "Bible",
      score,
    });
  }

  return takeTop(results, MAX_TOTAL).map(({ score: _score, ...row }) => row);
}
