# AGENTS.md

## プロジェクト概要

質問に答えると、今日のごはんを提案する Web アプリです。5段階（はい、たぶんそう、どちらでも、たぶん違う、いいえ）の回答から料理ごとの一致度を計算し、上位 3 品を一致度 % 付きで表示します。

要件は [docs/requirements.md](docs/requirements.md)、システム設計は [docs/system-design.md](docs/system-design.md)、UI 設計は [docs/ui-design.md](docs/ui-design.md) にあります。

重要な決定とその背景は [docs/adr/](docs/adr/README.md) に記録します。新しい決定をしたら ADR を追加してください。

## 現状

- 推定エンジン（`src/engine/`）、料理と質問のデータ（`src/data/`）、テストがあります。画面は Next.js の最小構成（`src/app/`）だけで、DB の接続と API はまだありません。CI もまだありません。
- 技術スタックは、実行環境が Vercel、DB が Turso、画面と API が Next.js（React）、言語が TypeScript、機械学習も TypeScript（学習はローカル）、開発環境の統一が mise です。ORM など、その他は未確定です。

## コマンド

開発環境のセットアップ手順は [README.md](README.md) にあります。

Node と pnpm のバージョンは `mise.toml` で揃えます（Node 22、pnpm 12）。依存関係は `pnpm install` で入れます。`npm install` は使わないでください。`package-lock.json` が作られ、lock ファイルが 2 つになります。

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 本番用にビルド |
| `pnpm start` | ビルドしたアプリを起動 |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | テストを実行（Vitest） |
| `pnpm play` | 推定エンジンをターミナルで試す |

ここにないコマンドは推測しないでください。追加したら、この表も更新してください。

## 進め方

- 最初に、`docs/system-design.md` の料理×属性の表を作るデータ設計から進めます。
- 質問プールは、まず固定のものを使います。AI による質問生成は後から追加する +α 機能です。
- ドキュメントは、既存のものに合わせて日本語で書きます。

## ブランチ運用

- `stage` がデフォルトブランチです。作業ブランチは `stage` から切り、PR も `stage` に向けて出します。
- `main` は基本的に使いません。明示的に指示された場合を除き、`main` に PR を出さないでください。
- `stage` と `main` では、直接 push、force push、ブランチの削除が禁止されています。
- マージには PR の承認が 1 件必要です。最後の push は、push した本人以外の承認が必要です。
- Admin のバイパスは、明示的に指示された場合を除いて使わないでください。

## ステータスチェック

- `main` では `ci` というチェックが必須ですが、これを報告するワークフローはまだありません。
- `stage` に必須チェックはありません。技術スタックが決まって CI を導入するときに設定します。
