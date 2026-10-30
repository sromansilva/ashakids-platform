import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [".."],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@testing-library/react": fileURLToPath(new URL("./node_modules/@testing-library/react", import.meta.url)),
      "@testing-library/dom": fileURLToPath(new URL("./node_modules/@testing-library/dom", import.meta.url)),
      "@testing-library/jest-dom/vitest": fileURLToPath(new URL("./node_modules/@testing-library/jest-dom/dist/vitest.mjs", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("../tests/frontend/setup.ts", import.meta.url))],
    include: ["../tests/frontend/**/*.test.ts", "../tests/frontend/**/*.test.tsx"],
    testTimeout: 10000,
    maxWorkers: 2,
  },
});
