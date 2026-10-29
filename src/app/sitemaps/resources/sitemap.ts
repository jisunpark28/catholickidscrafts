import { buildResourcesSitemap } from "@/lib/sitemap-entries";
import type { MetadataRoute } from "next";

// Static sheet catalog (no DB / cookies) — prerender and refresh daily.
export const revalidate = 86400;

/** Dedicated sitemap for Sunday sheet landings + season hubs (~194 URLs). */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildResourcesSitemap();
}
