# 0006: アプリを Next.js、React、TypeScript で構成する

- ステータス: 承認済み
- 日付: 2026-11-23

## 背景

[0004](0004-use-hono-and-react.md) では、Cloudflare Workers との相性から Hono と React（Vite）を採用しました。実行環境を Vercel に変えたことで（[0005](0005-use-vercel-and-turso.md)）、その理由がなくなりました。

## 決定

- 画面と API を Next.js（App Router）で作ります。API は Route Handlers で実装します。
- 言語は TypeScript で、画面は React で作ります。
- Hono は使いません。

## 影響

- 画面と API を 1 つのプロジェクトで書けます。
- 推定ロジックはバックエンドで動かす方針なので（`docs/meeting/11-19/answer.md` の Q4）、回答のたびに Route Handlers が呼ばれます。1 セッションあたり約 7〜9 回の呼び出しになる見込みです。
- Next.js の要件を満たすため、`mise.toml` の Node は 22 のままとします（[0002](0002-use-mise-for-dev-environment.md)）。
