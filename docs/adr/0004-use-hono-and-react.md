# 0004: アプリを Hono、React、TypeScript で構成する

- ステータス: 承認済み
- 日付: 2026-11-05

## 背景

[0003](0003-use-nextjs-typescript-react.md) で Next.js を採用しましたが、Cloudflare Workers との兼ね合いが懸念でした。

Next.js 16.4.5 を OpenNext で最小構成のままビルドしたところ、Worker は約 4.6 MB で、ページも Worker を経由しました。無料プランの CPU 時間（1 リクエスト 10 ms）に収まるかは、本番で計測する必要があります。一方、Hono の API は約 59 KB の Worker で、ローカルの D1 から読み取れました。

## 決定

- API と Worker のエントリーポイントに Hono を使います。
- 画面は React で作り、Vite でビルドして SPA として配信します。
- 言語は、画面とバックエンドの両方で TypeScript を使います。
- `package.json` と Worker は、それぞれ 1 つにまとめます。

検討した他の案は次のとおりです。

- **Next.js + OpenNext:** 主流ですが、無料枠で動くか不明で、アダプターも必要です。
- **Next.js の静的書き出し + Hono:** 動作は確認しましたが、構成が複雑になります。
- **Hono + `hono/jsx`:** 依存は最小ですが、React のライブラリと情報を活かせません。
- **Python のバックエンド:** 別の実行環境が必要で、現在の推定処理には不要です。

## 影響

- SSR は使わず、画面はブラウザ側で描画します。SSR が必要になった場合は、構成を見直します。
- 推定処理は TypeScript で実装します。高度なモデルの学習が必要になったら、外部で Python を使い、結果のパラメータだけを配信します。
- Wrangler が Node 22 以上を要求するため、`mise.toml` で Node 22 を指定します。
- 本番の CPU 時間と、Vite を含めた全体の構成は未検証なので、最初のデプロイで確認します。
