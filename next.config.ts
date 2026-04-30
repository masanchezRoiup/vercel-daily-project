import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components memoizes RSC render output across the tree so a data function called by
  // multiple components on a page only runs once per cache window, not once per component.
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
