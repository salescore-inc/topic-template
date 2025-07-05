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
import { randomUUID } from "crypto";
import { parse } from "csv-parse/sync";
import { Phase, Section, Topic, Template } from "./types";

// --------------------------------------------------
// ユーティリティ
// --------------------------------------------------

/** UUIDを生成する関数 (RFC4122 v4準拠) */
function generateUUID(): string {
  return randomUUID();
}

/** 名前からIDへのマッピングを管理するクラス */
class NameToIdMapper {
  private nameToIdMap = new Map<string, string>();

  getOrCreateId(name: string): string {
    if (!this.nameToIdMap.has(name)) {
      this.nameToIdMap.set(name, generateUUID());
    }
    return this.nameToIdMap.get(name)!;
  }
}

/** パステルカラーをカテゴリごとに割り当てる簡易ジェネレータ */
function colorByIndex(i: number): string {
  const palette = [
    "#4287f5",
    "#3db063",
    "#f5a742",
    "#f54242",
    "#9c42f5",
    "#42c5f5",
    "#e67e22",
    "#7a7a7a",
  ];
  return palette[i % palette.length];
}

// --------------------------------------------------
// メインロジック
// --------------------------------------------------

function convert(csvFile: string, name: string, description: string, category: string = "general"): Template {
  const csv = fs.readFileSync(csvFile, "utf8");
  const records: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // フェーズ / セクション / トピック を順にマッピング
  const phaseMap = new Map<string, Phase>();
  const sectionMap = new Map<string, Section[]>();
  const topicMap = new Map<string, Topic>();
  const allTags = new Set<string>();

  // IDマッパーを初期化
  const phaseMapper = new NameToIdMapper();
  const sectionMapper = new NameToIdMapper();
  const topicMapper = new NameToIdMapper();

  let topicIndex = 1;

  for (const rec of records) {
    const tag = rec.tags || "";
    const phaseName = rec.phase;
    const sectionName = rec.section;
    const topicName = rec.topic;

    // IDを生成または取得
    const phaseId = phaseMapper.getOrCreateId(phaseName);
    const sectionId = sectionMapper.getOrCreateId(sectionName);
    const topicId = topicMapper.getOrCreateId(topicName);

    // ---- フェーズ登録 ----
    if (!phaseMap.has(phaseId)) {
      const phase: Phase = {
        id: phaseId,
        name: phaseName,
        description: "",
        color: colorByIndex(phaseMap.size),
      };
      phaseMap.set(phaseId, phase);
    }

    // ---- セクション登録 ----
    if (!sectionMap.has(phaseId)) sectionMap.set(phaseId, []);
    const secArray = sectionMap.get(phaseId)!;
    if (!secArray.find((s) => s.id === sectionId)) {
      const section: Section = {
        id: sectionId,
        name: sectionName,
        description: "",
        phaseId,
        index: secArray.length + 1,
      };
      secArray.push(section);
    }

    // ---- トピック登録 ----
    if (!topicMap.has(topicId)) {
      const topic: Topic = {
        id: topicId,
        title: topicName,
        phaseId,
        sectionId,
        extractionPrompt: rec.prompt || "",
        status: "pending",
        error: null,
        index: topicIndex++,
        tags: [],
      };
      topicMap.set(topicId, topic);
    }

    // タグの追加
    if (tag) {
      const topic = topicMap.get(topicId)!;
      if (!topic.tags.includes(tag)) {
        topic.tags.push(tag);
      }
      allTags.add(tag);
    }
  }

  // フェーズごとに sections をフラット化し順序保証
  const sections: Section[] = [];
  for (const phase of phaseMap.values()) {
    const list = sectionMap.get(phase.id) || [];
    sections.push(...list);
  }

  // トピックをMapから配列に変換
  const topics = Array.from(topicMap.values());

  // ---- テンプレート生成 ----
  const template: Template = {
    id: generateUUID(),
    name,
    description,
    category,
    phases: Array.from(phaseMap.values()),
    sections,
    topics,
    relations: [],
    reasonings: [],
    tags: Array.from(allTags).sort(),
  };

  return template;
}

// --------------------------------------------------
// エントリポイント
// --------------------------------------------------

function main(): void {
  const [input, output, name, description, category] = process.argv.slice(2);
  if (!input || !output || !name || !description) {
    console.error("Usage: topic-template <input.csv> <output.json> <name> <description> [category]");
    console.error("Example: topic-template input.csv output.json \"採用テンプレート\" \"採用プロセス用のニーズマップテンプレート\" \"recruitment\"");
    process.exit(1);
  }

  const absIn = path.resolve(input);
  const absOut = path.resolve(output);

  const tpl = convert(absIn, name, description, category);
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
