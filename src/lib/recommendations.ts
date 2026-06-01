import type { RecommendationKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RecommendationItem } from "@/lib/recommendation-types";

function mapRow(r: {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  kind: RecommendationKind;
  externalUrl: string;
  author: string | null;
  imageUrl: string | null;
  tags: string;
  sortOrder: number;
}): RecommendationItem {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    description: r.description,
    kind: r.kind,
    externalUrl: r.externalUrl,
    author: r.author ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    tags: r.tags,
    sortOrder: r.sortOrder,
  };
}

export async function getPublishedRecommendations(options: {
  q?: string;
  kind?: RecommendationKind;
}): Promise<RecommendationItem[]> {
  const where: Prisma.RecommendationWhereInput = { published: true };

  if (options.kind) {
    where.kind = options.kind;
  }

  const q = options.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.recommendation.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return rows.map(mapRow);
}

export async function getRecommendationBySlug(
  slug: string,
): Promise<RecommendationItem | undefined> {
  const row = await prisma.recommendation.findFirst({
    where: { slug, published: true },
  });
  return row ? mapRow(row) : undefined;
}

export async function getAllRecommendationSlugs(): Promise<string[]> {
  const rows = await prisma.recommendation.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
