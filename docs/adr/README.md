# ADR（Architecture Decision Records）

このプロジェクトの重要な決定と、その背景を記録します。

## 書き方

- ファイル名は `NNNN-決定の内容.md` とし、番号は連番にします。
- 内容は「ステータス」「背景」「決定」「影響」の 4 項目で書きます。
- ステータスは「提案中」「承認済み」「廃止」のいずれかです。別の ADR に置き換えた場合は「廃止」にし、置き換え先の ADR へのリンクを書きます。
- 承認済みの ADR の決定内容は書き換えず、変更する場合は新しい ADR を追加します。

## 一覧

| 番号 | タイトル | ステータス |
|---|---|---|
| [0001](0001-use-cloudflare-workers-and-d1.md) | 実行環境に Cloudflare Workers、DB に D1 を使う | 承認済み |
| [0002](0002-use-mise-for-dev-environment.md) | 開発環境の統一に mise を使う | 承認済み |
| [0003](0003-use-nextjs-typescript-react.md) | フロントエンドに Next.js、TypeScript、React を使う | 廃止（0004 に置き換え） |
| [0004](0004-use-hono-and-react.md) | アプリを Hono、React、TypeScript で構成する | 承認済み |
