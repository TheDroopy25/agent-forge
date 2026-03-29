import type { NextConfig } from "next";

// Static export only when building for Electron desktop app.
// Vercel deployments use normal Next.js server mode.
const isElectronBuild = process.env.BUILD_TARGET === "electron";

const nextConfig: NextConfig = {
  ...(isElectronBuild && {
    output: "export",
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
