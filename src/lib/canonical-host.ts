/** Production hosts that should redirect to https://www.catholickidscrafts.com */
export const CANONICAL_SITE_HOST = "www.catholickidscrafts.com";

const PRODUCTION_HOSTS = new Set([
  "catholickidscrafts.com",
  CANONICAL_SITE_HOST,
]);

export type CanonicalRedirectInput = {
  hostname: string;
  protocol: "http:" | "https:";
};

export type CanonicalRedirectResult = {
  hostname: string;
  protocol: "https:";
};

/** Strip port from a Host / X-Forwarded-Host header value. */
export function hostnameFromHostHeader(hostHeader: string): string {
  return hostHeader.split(":")[0]?.toLowerCase() ?? "";
}

/**
 * Vercel deployment hosts (production alias + previews). Keep them usable for
 * previews/OAuth, but never let Google index them as a second site.
 */
export function isVercelDeploymentHost(hostname: string): boolean {
  return hostnameFromHostHeader(hostname).endsWith(".vercel.app");
}

/** Returns canonical host/protocol when apex or HTTP should 308 to www HTTPS. */
export function getCanonicalRedirectTarget(
  input: CanonicalRedirectInput,
): CanonicalRedirectResult | null {
  const hostname = hostnameFromHostHeader(input.hostname);
  if (!PRODUCTION_HOSTS.has(hostname)) return null;

  let nextHost = hostname;
  const needsHttps = input.protocol === "http:";

  if (hostname === "catholickidscrafts.com") {
    nextHost = CANONICAL_SITE_HOST;
  }

  if (!needsHttps && nextHost === hostname) {
    return null;
  }

  return { hostname: nextHost, protocol: "https:" };
}
