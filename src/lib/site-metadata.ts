import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

const siteUrl = getSiteUrl();
const SITE_DESCRIPTION =
  "Free printable Sunday Gospel sheets, Bible typing, prayer flip cards and liturgical-year activities for catechists and parents, following the Church calendar.";

/** Shared site metadata (verification tag is injected in root layout `<head>`). */
export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Catholic Kids Crafts | Free Mass, Bible & Prayer Activities",
    template: "%s | Catholic Kids Crafts",
  },
  description:
    SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Catholic Kids Crafts",
    title: "Catholic Kids Crafts | Free Mass, Bible & Prayer Activities",
    description:
      SITE_DESCRIPTION,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Catholic Kids Crafts" }],
  },
  twitter: {
    card: "summary",
    title: "Catholic Kids Crafts",
    description:
      SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "96x96" },
      { url: "/logo-icon.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

/** Per-page canonical URL (path only; resolved via root `metadataBase`). */
export function canonicalForPath(path: string): Pick<Metadata, "alternates"> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return { alternates: { canonical: normalized } };
}

const SITE_NAME = "Catholic Kids Crafts";
const DEFAULT_OG_IMAGE = { url: "/logo.png", width: 512, height: 512, alt: SITE_NAME };

export type PageOgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

type PageMetadataInput = {
  /** Page title without the " | Catholic Kids Crafts" suffix (the root template adds it). */
  title: string;
  /** Use the title as-is with no site suffix (e.g. when the brand is already in it). */
  absoluteTitle?: boolean;
  description: string;
  /** Canonical path, e.g. "/mass". Also used for og:url. */
  path: string;
  robots?: Metadata["robots"];
  /**
   * Optional Open Graph / Twitter image. Defaults to the site logo.
   * SEO pin pages pass the 1000×1500 `/api/og/pin` image here.
   */
  image?: PageOgImage;
};

/**
 * Per-page SEO metadata: title, description, canonical, and matching Open Graph / Twitter
 * tags (og:title without the site suffix, og:url = canonical). Next.js replaces the root
 * openGraph/twitter objects instead of merging them, so the shared fields are repeated here.
 */
export function pageMetadata({ title, absoluteTitle, description, path, robots, image }: PageMetadataInput): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  // Keep Twitter on "summary" site-wide (2:3 pins are for Pinterest/OG; avoid changing non-SEO pages).
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    ...(robots ? { robots } : {}),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
