import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's root to this app dir. Without it, the ancestor
  // pnpm-workspace.yaml gets picked as root and every route 404s in dev.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
