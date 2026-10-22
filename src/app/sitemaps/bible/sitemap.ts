import { buildBibleChaptersSitemap } from "@/lib/sitemap-entries";
import type { MetadataRoute } from "next";

// The book list fetch is cached for a day (fetchBibleBooks revalidate), so this stays cheap.
export const dynamic = "force-dynamic";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildBibleChaptersSitemap();
}
