/**
 * Template types for CSV to JSON conversion
 * CSV to JSON変換用のテンプレート型定義
 */

/**
 * Phase model
 * フェーズモデル
 */
export interface Phase {
  id: string;
  name: string;
  description: string;
  color: string;
}

/**
 * Section model
 * セクションモデル
 */
export interface Section {
  id: string;
  name: string;
  description: string;
  phaseId: string;
  index: number;
}

/**
 * Topic model
 * トピックモデル
 */
export interface Topic {
  id: string;
  title: string;
  phaseId: string;
  sectionId: string;
  extractionPrompt: string;
  status: "pending";
  error: null;
  index: number;
}

/**
 * Template model
 * テンプレートモデル
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  phases: Phase[];
  sections: Section[];
  topics: Topic[];
  relations: never[];
  reasonings: never[];
}