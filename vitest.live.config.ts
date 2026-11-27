import { loadEnvFile } from "node:process";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

loadEnvFile(".env.local");
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/server-only.ts", import.meta.url),
      ),
    },
  },
  test: { include: ["tests/live/**/*.live.ts"], testTimeout: 65000 },
});
