import fs from "fs";
import { randomUUID } from "crypto";
import { parse } from "csv-parse/sync";
import { Phase, Section, Topic, Template } from "./types";
export { Phase, Section, Topic, Template };

// --------------------------------------------------
// ユーティリティ
// --------------------------------------------------

export function generateUUID(): string {
  return randomUUID();
}

export class NameToIdMapper {
  private nameToIdMap = new Map<string, string>();

  getOrCreateId(name: string): string {
    if (!this.nameToIdMap.has(name)) {
      this.nameToIdMap.set(name, generateUUID());
    }
    return this.nameToIdMap.get(name)!;
  }
}

export function colorByIndex(i: number): string {
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

export function convertCsvToTemplate(csvFile: string, name: string, description: string, category: string = "general"): Template {
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

