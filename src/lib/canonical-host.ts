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

/** Returns canonical host/protocol when apex or HTTP should 308 to www HTTPS. */
export function getCanonicalRedirectTarget(
  input: CanonicalRedirectInput,
): CanonicalRedirectResult | null {
  const hostname = input.hostname.split(":")[0]?.toLowerCase() ?? "";
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
