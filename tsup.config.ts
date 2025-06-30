import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],          // Node.js CLIツールはCJSのみで十分
  target: "node20",         // 実行環境
  outDir: "dist",
  splitting: false,         // 1 ファイルにまとめる
  sourcemap: true,
  clean: true,
  dts: true,                // 型定義ファイル (*.d.ts) も生成
  bundle: true,             // 依存関係をバンドル
  noExternal: ["csv-parse"] // csv-parseをバンドルに含める
});
