import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      exclude: [
        "node_modules/",
        "dist/",
        "test/",
        "src/components/events/index.ts",
        "src/hooks/index.ts",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
});
