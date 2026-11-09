import { buildBibleChaptersSitemap } from "@/lib/sitemap-entries";
import type { MetadataRoute } from "next";

// Prerendered at build and refreshed daily (ISR). The book list fetch is also cached for a day.
export const revalidate = 86400;

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildBibleChaptersSitemap();
}
