import { buildResourcesSitemap } from "@/lib/sitemap-entries";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

/** Dedicated sitemap for Sunday sheet landings + season hubs (~194 URLs). */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildResourcesSitemap();
}
