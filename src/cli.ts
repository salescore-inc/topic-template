#!/usr/bin/env node

/**
 * topic-template CLI
 * ------------------
 * CSV → JSON(Template) 変換CLIツール
 *
 * ## 使い方
 *   # グローバルインストール
 *   $ npm install -g topic-template
 *   $ topic-template input.csv output.json "Template Name" "Template Description"
 *
 *   # npxで直接実行
 *   $ npx topic-template input.csv output.json "Template Name" "Template Description"
 *
 * ### CSV の想定カラム
 * | tag | phase | section | topic | extractionPrompt |
 * |-----|-------|---------|-------|------------------|
 * tag              … タグ（IS・キャリア エントリー など）
 * phase            … 大カテゴリ（課題-1 など）
 * section          … 中カテゴリ（母集団形成 など）
 * topic            … 小カテゴリ（接点済人数 など）
 * extractionPrompt … 判定条件や定義
 *
 * phase / section が新たに出現した順に index を採番し、
 * 既出の組合せには同じ index を再利用します。
 */

import fs from "fs";
import path from "path";
import { convertCsvStringToTemplate } from "./index";

function main(): void {
  const [input, output, name, description, category] = process.argv.slice(2);
  if (!input || !output || !name || !description) {
    console.error("Usage: topic-template <input.csv> <output.json> <name> <description> [category]");
    console.error("Example: topic-template input.csv output.json \"採用テンプレート\" \"採用プロセス用のニーズマップテンプレート\" \"recruitment\"");
    process.exit(1);
  }

  const absIn = path.resolve(input);
  const absOut = path.resolve(output);

  // CSVファイルを読み込み
  const csvContent = fs.readFileSync(absIn, "utf8");
  const tpl = convertCsvStringToTemplate(csvContent, name, description, category);
  fs.writeFileSync(absOut, JSON.stringify(tpl, null, 2), "utf8");

  console.log(`✓ Template JSON written to ${absOut}`);
  console.log(`  ID: ${tpl.id}`);
  console.log(`  Name: ${tpl.name}`);
  console.log(`  Description: ${tpl.description}`);
  console.log(`  Category: ${tpl.category}`);
  console.log(`  Phases: ${tpl.phases.length}`);
  console.log(`  Sections: ${tpl.sections.length}`);
  console.log(`  Topics: ${tpl.topics.length}`);
  console.log(`  Tags: ${tpl.tags.length}`);
}

if (require.main === module) main();