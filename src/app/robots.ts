import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

/**
 * Static production robots.txt (no request headers, so it is prerendered at build).
 * *.vercel.app hosts get public/robots-noindex.txt (disallow all) through a
 * host-conditional rewrite in next.config.ts.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      // Longest match wins (Google/Pinterest), so /api/og/ pin images stay fetchable under /api/.
      allow: ["/", "/api/og/"],
      // /print/ stays crawlable so Google can read its noindex tag.
      // Account, reader, and sheet editor are app surfaces (also noindex where set).
      disallow: ["/admin/", "/api/", "/account/", "/reader/", "/resource/edit/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
