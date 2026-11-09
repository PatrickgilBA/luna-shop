// Settings for the automatic tests (Vitest). Run them with: npm test
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Same shortcut as in jsconfig.json: "@/lib/format" means "<project>/lib/format".
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
