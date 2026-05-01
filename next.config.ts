import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
