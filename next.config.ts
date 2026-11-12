import type { NextConfig } from "next";
import { cspHeaders } from "./src/lib/csp";
import { HOME_VARIANT_PREFIX, homeVariantRewrites } from "./src/lib/home-variants";

/**
 * Phase 1 baseline (nosniff, referrer, SAMEORIGIN, Permissions-Policy) plus
 * Phase 3b enforcing Content-Security-Policy. No report-only header.
 *
 * X-Frame-Options is SAMEORIGIN, not DENY: /play/church, /play/hangman, and
 * /play/face-to-emoji iframe same-origin `/games/*`. `frame-ancestors 'self'`
 * matches that intent.
 *
 * Permissions-Policy: Gospel reading recorder uses microphone; photo booth
 * uses camera. Both stay (self) only. Other powerful features are disabled.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), midi=(), display-capture=(), xr-spatial-tracking=()",
  },
  ...cspHeaders({
    isDev: process.env.NODE_ENV !== "production",
  }),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/resource/cards/*/download": ["./assets/card-originals/*.png"],
    "/api/resource/activities/*/download": ["./assets/activities/**/*.pdf"],
  },
  poweredByHeader: false,
  transpilePackages: ["fabric"],
  serverExternalPackages: ["@prisma/client", "prisma", "romcal"],
  async headers() {
    return [
      { source: "/", headers: securityHeaders },
      { source: "/:path*", headers: securityHeaders },
      // *.vercel.app (production alias + previews): usable, never indexed. Was in middleware;
      // robots.txt is rewritten to a disallow-all file on these hosts (rewrites below).
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<h>.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Internal per-country home copies: only meant to be served at `/` via the rewrites below.
      // Headers match the requested path, so `/` itself is not affected.
      {
        source: `${HOME_VARIANT_PREFIX}/:path*`,
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  async rewrites() {
    return {
      // *.vercel.app gets disallow-all robots; www/apex keep the static src/app/robots.ts.
      beforeFiles: [
        {
          source: "/robots.txt",
          has: [{ type: "host", value: "(?<h>.*)\\.vercel\\.app" }],
          destination: "/robots-noindex.txt",
        },
        // Old storage-numbered reader links (?douay=1) go to a tiny redirect route, so the
        // chapter page itself never reads the query string and can stay static.
        {
          source: "/bible/read/:bookSlug/:chapter",
          has: [{ type: "query", key: "douay", value: "1" }],
          destination: "/api/bible/read-redirect/:bookSlug/:chapter",
        },
        // `/` -> static per-country home (ckc_country cookie, then Vercel IP country), on the CDN.
        ...homeVariantRewrites(),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      {
        source: "/resources/holy-trinity/:file*",
        destination: "/images/holy-trinity/:file*",
        permanent: true,
      },
      {
        source: "/play/emoji",
        destination: "/play/photo-booth",
        permanent: false,
      },
      {
        source: "/mass/:date(\\d{4}-\\d{2}-\\d{2})",
        destination: "/mass",
        permanent: true,
      },
      {
        source: "/gospel",
        destination: "/daily-mass",
        permanent: true,
      },
      { source: "/program", destination: "/", permanent: true },
      { source: "/program/:path*", destination: "/", permanent: true },
      { source: "/lesson/:path*", destination: "/", permanent: true },
      { source: "/curriculum", destination: "/", permanent: true },
      { source: "/curriculum/:path*", destination: "/", permanent: true },
      // Old `/resources` hubs (removed) -> live pages, to keep old pins and links working.
      // Season targets match seasonPath() in src/lib/resource/sheets.ts.
      { source: "/resources", destination: "/resource?view=all", permanent: true },
      { source: "/resources/advent", destination: "/liturgy/advent", permanent: true },
      { source: "/resources/christmas", destination: "/liturgy/christmas-time", permanent: true },
      { source: "/resources/lent", destination: "/liturgy/lent", permanent: true },
      { source: "/resources/easter", destination: "/liturgy/easter-time", permanent: true },
      { source: "/resources/ordinary-time", destination: "/liturgy/ordinary-time", permanent: true },
      { source: "/resources/feasts", destination: "/sunday-mass-worksheets#season-feasts", permanent: true },
      // Legacy curriculum printables (pre-Resource).
      ...[
        "advent-wreath-craft",
        "first-communion-examination",
        "holy-trinity-clover",
        "lent-stations-cross-craft",
        "noahs-ark-coloring",
      ].map((slug) => ({ source: `/resources/${slug}`, destination: "/resource?view=all", permanent: true })),
      // Deleted /catholic-faith-questions pages (pins sent Nov 6-9, 2026) -> live pages. 301 on request.
      // Specific slugs first; the hub and every other slug go to /qa-cards.
      ...[
        "the-sign-of-the-cross",
        "the-our-father-the-lord-s-prayer",
        "the-hail-mary",
        "the-glory-be",
        "the-apostles-creed",
      ].map((slug) => ({ source: `/catholic-faith-questions/${slug}`, destination: "/prayers", statusCode: 301 as const })),
      ...["introductory-rites", "liturgy-of-the-word", "liturgy-of-the-eucharist", "four-parts-of-the-mass"].map((slug) => ({
        source: `/catholic-faith-questions/${slug}`,
        destination: `/catholic-mass-for-kids/${slug}`,
        statusCode: 301 as const,
      })),
      { source: "/catholic-faith-questions", destination: "/qa-cards", statusCode: 301 },
      { source: "/catholic-faith-questions/:slug*", destination: "/qa-cards", statusCode: 301 },
    ];
  },
};

export default nextConfig;

