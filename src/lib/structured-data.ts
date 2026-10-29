import { getSiteUrl } from "@/lib/site-url";

/**
 * Schema.org JSON-LD builders (no FAQPage: Google dropped FAQ rich results in 2026, and
 * markup must only describe content that is visible on the page). Reusable for future
 * pages such as a dedicated worksheet page (subscription or single purchase).
 */

export const SITE_NAME = "Catholic Kids Crafts";
export const SITE_DESCRIPTION =
  "Free printable Sunday Gospel sheets, Bible typing, prayer flip cards and liturgical-year activities for catechists and parents, following the Church calendar.";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };
export type JsonLdNode = { [key: string]: JsonValue | undefined };

export function absoluteSiteUrl(path: string): string {
  const base = getSiteUrl().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  if (path === "/" || path === "") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const organizationId = () => `${absoluteSiteUrl("/")}#organization`;
export const websiteId = () => `${absoluteSiteUrl("/")}#website`;

/**
 * Serialize JSON-LD for a <script type="application/ld+json"> tag. Escapes <, > and &
 * (plus U+2028/2029) so DB strings can never close the script tag or inject HTML.
 */
export function serializeJsonLd(data: JsonLdNode | JsonLdNode[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Wrap one or more nodes in a single @graph document. */
export function jsonLdGraph(nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    url: absoluteSiteUrl("/"),
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": organizationId() },
  };
}

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": organizationId(),
    name: SITE_NAME,
    url: absoluteSiteUrl("/"),
    logo: absoluteSiteUrl("/logo.png"),
  };
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList: Home first, then each level; the last item is the current page. */
export function breadcrumbNode(trail: Crumb[]): JsonLdNode {
  const items: Crumb[] = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteSiteUrl(c.path),
    })),
  };
}

export type WorksheetInput = {
  name: string;
  /** e.g. "Matthew 22:34-40" */
  gospelRef?: string;
  description?: string;
  /** Short plain-text summary of the worksheet's story (also printed on the sheet). */
  abstract?: string;
  /** Key Gospel verse quoted on the sheet. */
  keyVerse?: string;
  /** Page where the worksheet is shown (canonical). */
  pagePath: string;
  /** True only when every level can be printed without Plus or a purchase. */
  isAccessibleForFree: boolean;
  /** Future paid worksheet pages: price in the given currency. */
  offer?: { price: number; priceCurrency: string };
};

/** LearningResource for a printable worksheet (rich-result oriented). */
export function worksheetNode(input: WorksheetInput): JsonLdNode {
  return {
    "@type": "LearningResource",
    name: input.name,
    description: input.description,
    abstract: input.abstract,
    learningResourceType: "Worksheet",
    educationalLevel: ["Kindergarten", "Elementary School"],
    about: input.gospelRef
      ? { "@type": "Thing", name: input.gospelRef, ...(input.keyVerse ? { description: input.keyVerse } : {}) }
      : undefined,
    isAccessibleForFree: input.isAccessibleForFree,
    inLanguage: "en",
    url: absoluteSiteUrl(input.pagePath),
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteSiteUrl("/") },
    provider: { "@id": organizationId() },
    offers: input.offer
      ? { "@type": "Offer", price: input.offer.price, priceCurrency: input.offer.priceCurrency }
      : undefined,
  };
}

export type PlayAppInput = {
  name: string;
  description: string;
  path: string;
  /** "game" -> VideoGame; "tool" (photo apps) -> WebApplication. */
  kind: "game" | "tool";
};

/** A free browser game or tool. Free is honest: no game on /play is behind Plus. No ratings. */
export function playAppNode(input: PlayAppInput): JsonLdNode {
  const url = absoluteSiteUrl(input.path);
  return {
    "@type": input.kind === "game" ? "VideoGame" : "WebApplication",
    name: input.name,
    description: input.description,
    url,
    applicationCategory: input.kind === "game" ? "GameApplication" : "MultimediaApplication",
    operatingSystem: "Any (web browser)",
    ...(input.kind === "game" ? { gamePlatform: "Web browser" } : {}),
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    publisher: { "@id": organizationId() },
  };
}

/** ItemList of links (e.g. the /play listing). */
export function itemListNode(name: string, items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteSiteUrl(it.path),
    })),
  };
}
