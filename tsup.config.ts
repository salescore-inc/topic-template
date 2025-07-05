import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    target: "node20",
    outDir: "dist",
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    bundle: true,
    noExternal: ["csv-parse"]
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "es2020",
    outDir: "dist",
    outExtension: () => ({ js: ".browser.js" }),
    splitting: false,
    sourcemap: true,
    dts: false,
    bundle: true,
    noExternal: ["csv-parse"],
    platform: "browser",
    define: {
      "process.env.NODE_ENV": '"production"'
    }
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
