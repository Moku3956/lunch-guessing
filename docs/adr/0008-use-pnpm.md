# 0008: パッケージマネージャーに pnpm を使う

- ステータス: 承認済み
- 日付: 2026-11-23

## 背景

これまで npm を使っていました。依存パッケージがまだ少なく、移行の手間が最も小さい今のうちに、パッケージマネージャーを見直すことにしました。

## 決定

- パッケージマネージャーに pnpm を使います。
- pnpm のバージョンは、Node と同じく `mise.toml` で固定します（[0002](0002-use-mise-for-dev-environment.md)）。現在は pnpm 12 です。
- lock ファイルは `pnpm-lock.yaml` だけにし、`package-lock.json` は削除します。
- 依存パッケージのインストール時のスクリプトは、`pnpm-workspace.yaml` の `allowBuilds` で許可したものだけを実行します。

検討した他の案は次のとおりです。

- **npm のまま:** 問題はありませんが、インストールの速さとディスクの使用量で pnpm が有利です。
- **Corepack と `packageManager` で固定する:** Corepack は将来の Node に同梱されなくなる予定のため、すでに使っている mise にまとめます。

## 影響

- メンバー全員が同時に pnpm に切り替える必要があります。`npm install` を実行すると `package-lock.json` が作られ、lock ファイルが 2 つになるため使いません。
- `package.json` に書いていないパッケージは import できません。依存関係の記入漏れがエラーとして見つかります。
- esbuild（Vitest が内部で使用）のインストール時のスクリプトは、実行しなくてもテストが通るため `false` にしています。動かない環境が出てきたら `true` に変えます。
- インストールが速くなり、ディスクの使用量も減ります。
- CI では `pnpm install --frozen-lockfile` を使い、lock ファイルが勝手に書き換わらないようにします。
- Vercel が pnpm 12 に対応しているかは未確認です。デプロイで問題が起きたら、`package.json` の `packageManager` で pnpm のバージョンを指定し、Vercel の環境変数に `ENABLE_EXPERIMENTAL_COREPACK=1` を設定します。
