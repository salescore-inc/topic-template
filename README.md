# topic-template

CSV から TopicFlow テンプレートを生成するCLIツール

## インストール

```bash
# npm
npm install -g topic-template

# または npx で直接実行
npx topic-template
```

## 使い方

```bash
topic-template <input.csv> <output.json> <name> <description> [category]
```

### 引数

- `input.csv`: 入力CSVファイルのパス
- `output.json`: 出力JSONファイルのパス
- `name`: テンプレートの名前
- `description`: テンプレートの説明
- `category`: (オプション) テンプレートのカテゴリー（デフォルト: "general"）

### 例

```bash
topic-template input.csv output.json "採用テンプレート" "採用プロセス用のニーズマップテンプレート" "recruitment"
```

## CSV フォーマット

CSVファイルは以下の4つのカラムを持つ必要があります：

| phase | section | topic | extractionPrompt |
|-------|---------|-------|------------------|
| 課題-1 | 母集団形成 | 接点済人数 | 学生が企業と何らかの接点を持った人数について言及している部分を抽出してください |
| 課題-1 | 母集団形成 | 応募者数 | 実際に応募した学生の人数について言及している部分を抽出してください |

- **phase**: 大カテゴリ（フェーズ）
- **section**: 中カテゴリ（セクション）
- **topic**: 小カテゴリ（トピック）
- **extractionPrompt**: 抽出時の判定条件や定義

## 開発

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm build

# 開発モード（ファイル監視）
pnpm dev
```

## ライセンス

MIT

## リポジトリ

[https://github.com/salescore-inc/topic-template](https://github.com/salescore-inc/topic-template)