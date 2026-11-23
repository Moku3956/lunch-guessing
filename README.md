# lunch-guessing

質問に答えると、今日のごはんを提案する Web アプリです。

要件と設計は [docs/](docs/requirements.md)、重要な決定は [docs/adr/](docs/adr/README.md) にあります。

## 開発環境のセットアップ

### 1. mise を入れる（PC ごとに 1 回）

```bash
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
```

ターミナルを開き直し、`type mise` が `mise is a function` になれば有効です。

Windows の場合は WSL2 の中で実行してください。

### 2. リポジトリを準備する

```bash
git clone git@github.com:Moku3956/lunch-guessing.git  # 初めての場合
cd lunch-guessing
git pull
rm -rf node_modules  # npm 時代の node_modules が残っている場合
mise trust
mise install
pnpm install
```

`npm install` は使わないでください。`package-lock.json` が作られ、lock ファイルが 2 つになります。

### 3. 動作を確認する

```bash
node -v         # v22.x
pnpm --version  # 12.x
pnpm test
```

`node -v` が v22 にならない場合は、`which node` でどこの node が使われているか確認してください。nvm が優先されていることがあります。

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 本番用にビルド |
| `pnpm start` | ビルドしたアプリを起動 |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | テストを実行（Vitest） |
| `pnpm play` | 推定エンジンをターミナルで試す |
