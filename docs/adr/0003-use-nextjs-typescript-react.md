# 0003: フロントエンドに Next.js、TypeScript、React を使う

- ステータス: 廃止（[0004](0004-use-hono-and-react.md) に置き換え）
- 日付: 2026-11-05

## 背景

Web アプリのフレームワークと言語を決める必要がありました。実行環境は Cloudflare Workers です（[0001](0001-use-cloudflare-workers-and-d1.md)）。

## 決定

Next.js、TypeScript、React を使います。

## 影響

- Next.js を Workers で動かす方法と、Workers の容量や CPU 時間の上限に収まるかを確認する必要があります。
- `mise.toml` で指定する Node のバージョンは、Next.js と Wrangler の要件に合わせて決めます（[0002](0002-use-mise-for-dev-environment.md)）。
- バックエンドの言語と構成は、この ADR の対象外です。
