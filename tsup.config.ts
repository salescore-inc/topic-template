import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    target: "es2020",
    outDir: "dist",
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    bundle: true,
    noExternal: ["csv-parse"]
  },
  {
    entry: ["src/cli.ts"],
    format: ["cjs"],
    target: "node20",
    outDir: "dist",
    splitting: false,
    sourcemap: true,
    dts: false,
    bundle: true,
    noExternal: ["csv-parse"]
  }
]);
