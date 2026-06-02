/** Canonical site origin for sitemap, robots, and metadata. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://www.catholickidscrafts.com";

  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return normalizeCanonicalSiteUrl(withProtocol.replace(/\/$/, ""));
}

/**
 * Production redirects apex → www; keep sitemap/metadata on the same host Google sees.
 */
export function normalizeCanonicalSiteUrl(url: string): string {
  try {
    const u = new URL(url);
    if (
      u.hostname === "catholickidscrafts.com" ||
      u.hostname === "www.catholickidscrafts.com"
    ) {
      u.hostname = "www.catholickidscrafts.com";
      u.protocol = "https:";
    }
    return u.origin;
  } catch {
    return url;
  }
}
