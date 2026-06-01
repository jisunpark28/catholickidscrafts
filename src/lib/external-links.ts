import type { ExternalLinkType } from "@prisma/client";

const AMAZON_HOST_RE =
  /^(?:www\.)?(?:amazon\.(?:com|co\.uk|de|fr|it|es|ca|com\.au|co\.jp|in|com\.mx|com\.br)|amzn\.to|a\.co)(?:\/|$)/i;

export function isAmazonUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return AMAZON_HOST_RE.test(host) || host === "amzn.to" || host === "a.co";
  } catch {
    return false;
  }
}

/** Effective link type: explicit DB value, or auto-detect Amazon hosts. */
export function resolveLinkType(
  linkType: ExternalLinkType,
  externalUrl: string,
): ExternalLinkType {
  if (linkType === "AMAZON_AFFILIATE") return "AMAZON_AFFILIATE";
  if (isAmazonUrl(externalUrl)) return "AMAZON_AFFILIATE";
  return "STANDARD";
}

export function isAmazonAffiliateLink(
  linkType: ExternalLinkType,
  externalUrl: string,
): boolean {
  return resolveLinkType(linkType, externalUrl) === "AMAZON_AFFILIATE";
}

export function externalLinkRel(
  linkType: ExternalLinkType,
  externalUrl: string,
): string {
  const base = "noopener noreferrer";
  if (isAmazonAffiliateLink(linkType, externalUrl)) {
    return `${base} sponsored`;
  }
  return base;
}

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "As an Amazon Associate, Catholic Kids Crafts earns from qualifying purchases.";

export const AMAZON_ASSOCIATE_DISCLOSURE_SHORT =
  "Amazon Associate — we may earn from qualifying purchases.";
