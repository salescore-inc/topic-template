import { parse } from "csv-parse/sync";
import { Phase, Section, Topic, Template } from "./types";
export { Phase, Section, Topic, Template };

// --------------------------------------------------
// バリデーション関連の型
// --------------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics?: {
    totalRows: number;
    phaseCount: number;
    sectionCount: number;
    topicCount: number;
  };
}

// --------------------------------------------------
// バリデーション関数
// --------------------------------------------------

export function validateCsvData(csvString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requiredColumns = ["phase", "section", "topic"];
  const optionalColumns = ["prompt", "tags"];

  try {
    const records: Record<string, string>[] = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      errors.push("CSVファイルにデータが含まれていません");
      return { isValid: false, errors, warnings };
    }

    // カラムの存在確認
    const columns = Object.keys(records[0]);
    
    // 必須カラムの存在確認
    for (const required of requiredColumns) {
      if (!columns.includes(required)) {
        errors.push(`必須カラム「${required}」が見つかりません`);
      }
    }

    // 不正なカラム名の警告
    const validColumns = [...requiredColumns, ...optionalColumns];
    const invalidColumns = columns.filter(col => !validColumns.includes(col));
    if (invalidColumns.length > 0) {
      warnings.push(`不明なカラムが含まれています: ${invalidColumns.join(", ")}`);
    }

    // 各行の基本バリデーション
    const phaseNames = new Set<string>();
    const sectionNames = new Set<string>();
    const topicNames = new Set<string>();

    records.forEach((record, index) => {
      const rowNum = index + 2; // ヘッダー行を考慮
      
      // 必須フィールドの空チェック
      if (!record["phase"] || record["phase"].trim() === "") {
        errors.push(`行${rowNum}: phaseが空です`);
      } else {
        phaseNames.add(record["phase"].trim());
      }

      if (!record["section"] || record["section"].trim() === "") {
        errors.push(`行${rowNum}: sectionが空です`);
      } else {
        sectionNames.add(record["section"].trim());
      }

      if (!record["topic"] || record["topic"].trim() === "") {
        errors.push(`行${rowNum}: topicが空です`);
      } else {
        topicNames.add(record["topic"].trim());
      }

      // promptは空でも警告レベル
      if (!record["prompt"] || record["prompt"].trim() === "") {
        warnings.push(`行${rowNum}: promptが空です`);
      }
    });

    const statistics = {
      totalRows: records.length,
      phaseCount: phaseNames.size,
      sectionCount: sectionNames.size,
      topicCount: topicNames.size,
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      statistics,
    };

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Invalid Record Length")) {
        errors.push("CSVファイルの形式が正しくありません（カラム数が一致しない行があります）");
      } else if (error.message.includes("Invalid character")) {
        errors.push("CSVファイルに無効な文字が含まれています");
      } else {
        errors.push(`CSVファイルの解析に失敗しました: ${error.message}`);
      }
    } else {
      errors.push("CSVファイルの解析に失敗しました（不明なエラー）");
    }

    return { isValid: false, errors, warnings };
  }
}

// --------------------------------------------------
// ユーティリティ
// --------------------------------------------------

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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


export function convertCsvStringToTemplate(csvString: string, name: string, description: string, category: string = "general"): Template {
  // バリデーション実行
  const validation = validateCsvData(csvString);
  
  if (!validation.isValid) {
    throw new Error(`CSVバリデーションエラー:\n${validation.errors.join('\n')}`);
  }
  
  // 警告がある場合はコンソールに出力
  if (validation.warnings.length > 0) {
    console.warn('CSV警告:', validation.warnings.join('\n'));
  }
  
  // 統計情報をログ出力
  if (validation.statistics) {
    console.log(`CSV統計: ${validation.statistics.totalRows}行, ${validation.statistics.phaseCount}フェーズ, ${validation.statistics.sectionCount}セクション, ${validation.statistics.topicCount}トピック`);
  }

  const records: Record<string, string>[] = parse(csvString, {
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

