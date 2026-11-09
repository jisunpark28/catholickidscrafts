import { buildPagesSitemap } from "@/lib/sitemap-entries";
import type { MetadataRoute } from "next";

// Prerendered at build (Vercel build has database access) and refreshed daily (ISR).
export const revalidate = 86400;

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildPagesSitemap();
}
