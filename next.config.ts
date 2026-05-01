const nextConfig = {
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
} as const;

export default nextConfig;
