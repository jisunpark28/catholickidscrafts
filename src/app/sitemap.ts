import { getAllRecommendationSlugs } from "@/lib/recommendations";
import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function entry(
  path: string,
  options?: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority?: number;
  },
): MetadataRoute.Sitemap[0] {
  const base = getSiteUrl();
  return {
    url: path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`,
    lastModified: options?.lastModified ?? new Date(),
    changeFrequency: options?.changeFrequency ?? "weekly",
    priority: options?.priority ?? 0.5,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/mass", { changeFrequency: "daily", priority: 0.95 }),
    entry("/daily-mass", { changeFrequency: "daily", priority: 0.95 }),
    entry("/gallery", { changeFrequency: "weekly", priority: 0.7 }),
    entry("/recommendations", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/play", { changeFrequency: "weekly", priority: 0.75 }),
    entry("/prayers", { changeFrequency: "monthly", priority: 0.75 }),
    entry("/play/typing", { changeFrequency: "weekly", priority: 0.7 }),
    entry("/play/photo-booth", { changeFrequency: "weekly", priority: 0.7 }),
    entry("/play/face-to-emoji", { changeFrequency: "weekly", priority: 0.7 }),
    entry("/play/liturgical-vestments", { changeFrequency: "weekly", priority: 0.7 }),
    entry("/privacy", { changeFrequency: "yearly", priority: 0.3 }),
    entry("/terms", { changeFrequency: "yearly", priority: 0.3 }),
    entry("/affiliate-disclosure", { changeFrequency: "yearly", priority: 0.3 }),
  ];

  let recommendationUrls: MetadataRoute.Sitemap = [];

  try {
    const recommendationSlugs = await getAllRecommendationSlugs();

    recommendationUrls = recommendationSlugs.map((slug) =>
      entry(`/recommendations/${slug}`, { changeFrequency: "monthly", priority: 0.6 }),
    );
  } catch (e) {
    console.error("sitemap: database URLs skipped", e);
  }

  return [
    ...staticRoutes.map((e) => ({ ...e, lastModified: now })),
    ...recommendationUrls,
  ];
}
