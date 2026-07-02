import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // V1 tests validate contracts (Zod schemas, server-action logic) — no DOM needed.
    // Node env avoids pulling in the jsdom dependency chain. Add
    // `// @vitest-environment jsdom` per-file if a component test ever needs it.
    environment: "node",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
