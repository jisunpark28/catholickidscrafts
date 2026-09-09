import type { NextConfig } from "next";
import { cspReportOnlyHeaders } from "./src/lib/csp";

/**
 * Phase 3 — Content-Security-Policy-Report-Only only.
 * Do not add an enforcing `Content-Security-Policy` header here.
 * Phase 1 clickjacking headers (X-Frame-Options, etc.) stay on that PR;
 * `frame-ancestors 'self'` here matches SAMEORIGIN intent.
 */
const securityHeaders = cspReportOnlyHeaders({
  isDev: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "prisma", "romcal"],
  async headers() {
    return [
      { source: "/", headers: securityHeaders },
      { source: "/:path*", headers: securityHeaders },
    ];
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
      {
        source: "/old-testament",
        destination: "/bible/old-testament",
        permanent: true,
      },
      {
        source: "/new-testament",
        destination: "/bible/new-testament",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
