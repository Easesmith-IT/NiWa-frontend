import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "features/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/inbox.benchmark.test.ts",
    ],
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    testTimeout: 10_000,
    hookTimeout: 10_000,
    teardownTimeout: 5_000,
    reporters: ["default"],
  },
});
