import { absoluteUrl, CHILD_SITEMAP_PATHS, SITEMAP_CONTENT_DATE } from "@/lib/sitemap-entries";

/**
 * Sitemap index at /sitemap.xml (the URL robots.txt and Search Console use).
 * It points to the pages sitemap and the Bible chapters sitemap.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  const lastmod = SITEMAP_CONTENT_DATE.toISOString();
  const items = CHILD_SITEMAP_PATHS.map(
    (p) => `  <sitemap>\n    <loc>${absoluteUrl(p)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, must-revalidate",
    },
  });
}
