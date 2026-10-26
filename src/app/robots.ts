import { isVercelDeploymentHost } from "@/lib/canonical-host";
import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";

  // Deployment / preview hosts stay crawl-testable via browser, but must not be indexed.
  if (isVercelDeploymentHost(host)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /print/ stays crawlable so Google can read its noindex tag.
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
