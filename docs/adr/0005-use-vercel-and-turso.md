# 0005: 実行環境に Vercel、DB に Turso を使う

- ステータス: 承認済み
- 日付: 2026-11-23

## 背景

[0001](0001-use-cloudflare-workers-and-d1.md) では Cloudflare Workers と D1 を採用しましたが、Next.js を使いたいという要望がありました。Workers で Next.js を動かすには OpenNext が必要で、無料プランの CPU 時間（1 リクエスト 10 ms）に収まるかも確認できていませんでした。

また、機械学習はすべて TypeScript で行うことになり（[0007](0007-train-models-in-typescript.md)）、Python の実行環境を考える必要がなくなりました。

## 決定

アプリの実行環境に Vercel（Hobby プラン）、DB に Turso を使います。

検討した他の案は次のとおりです。

- **Cloudflare Workers + D1:** 1 社で完結し無料枠も大きいですが、Next.js との相性が懸念でした。
- **Vercel + Neon（Postgres）:** 開発中も DB にネット接続が必要です。
- **GCP（Firebase App Hosting など）:** 従量課金の Blaze プランとカード登録が必要で、Cloud SQL には無料枠がありません。

## 影響

- Next.js をアダプターなしで動かせます。
- 開発中は `@libsql/client` でローカルの SQLite ファイルに接続できるため、Docker もネット接続も不要です。
- Vercel Hobby の主な無料枠（2026-11 時点）は、関数の実行 100 万回/月、Active CPU 4 時間/月、転送量 100 GB/月です。上限を超えると、その機能を最大 30 日使えなくなります。
- Vercel Hobby にはチームでの共同作業の機能がありません。商用利用の可否は採用前に確認します。
- Turso Free の主な無料枠（2026-11 時点）は、ストレージ 5 GB、読み取り 5 億行/月、書き込み 1,000 万行/月です。
- Vercel と Turso の 2 つのアカウントと、接続情報の管理が必要です。
- Cloudflare 向けに追加した依存関係（`wrangler`、`hono`、`@cloudflare/workers-types`）と、それを前提にした設定は外します。Cloudflare 向けのコードはまだないため、作り直すものはありません。`src/engine/` の推定エンジンは、フレームワークに依存しないのでそのまま使えます。
