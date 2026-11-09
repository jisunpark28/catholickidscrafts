import type { NextConfig } from "next";
import { cspHeaders } from "./src/lib/csp";

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
        destination: "/bible/gospel",
        permanent: true,
      },
      { source: "/program", destination: "/", permanent: true },
      { source: "/program/:path*", destination: "/", permanent: true },
      { source: "/lesson/:path*", destination: "/", permanent: true },
      { source: "/curriculum", destination: "/", permanent: true },
      { source: "/curriculum/:path*", destination: "/", permanent: true },
      // Legacy curriculum printables (pre-Resource). `/resources` + `/resources/<season>` are live hubs now.
      ...[
        "advent-wreath-craft",
        "first-communion-examination",
        "holy-trinity-clover",
        "lent-stations-cross-craft",
        "noahs-ark-coloring",
      ].map((slug) => ({ source: `/resources/${slug}`, destination: "/resources", permanent: true })),
    ];
  },
};

export default nextConfig;

