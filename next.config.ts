import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/resources/holy-trinity/:file*",
        destination: "/images/holy-trinity/:file*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
