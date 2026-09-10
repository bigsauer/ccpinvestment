import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  ...(process.env.IIS_DEPLOY === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
