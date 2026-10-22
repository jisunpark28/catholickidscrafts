import { buildPagesSitemap } from "@/lib/sitemap-entries";
import type { MetadataRoute } from "next";

// Request-time so a build without database access never bakes in an empty recommendations list.
export const dynamic = "force-dynamic";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildPagesSitemap();
}
