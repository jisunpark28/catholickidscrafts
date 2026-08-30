import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "prisma", "romcal"],
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
        source: "/mass/:date",
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
