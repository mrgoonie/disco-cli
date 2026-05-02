import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "cli/main": "src/cli/main.ts",
    "core/index": "src/core/index.ts",
  },
  format: ["esm"],
  target: "node18",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  shims: true,
});
