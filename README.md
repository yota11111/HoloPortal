# Holo Portal

ホロライブ関連の公式ニュース、ライブ/イベント、配信予定、公式ショップ商品を整理する非公式ポータルです。

## 方針

- 公式情報への導線を中心にした非公式ファンサイトです。
- 現時点ではアフィリエイトリンクを使用しません。
- 将来の収益化に備えて、外部リンクは `src/data/links.json` と生成データ内の `normalUrl` / `affiliateUrl` / `isAffiliate` で分離します。
- タレント画像は公式プロフィールページの画像URLを参照し、画像ファイルの保存・再配布はしません。
- 運用状態は顧客向けページには出さず、ローカルコマンドまたはCIログで確認します。

## 現在の到達点

- トップ、配信、グッズ、ライブ/イベント、タレント一覧、タレント詳細ページを実装済み。
- 公式ニュース、公式ショップ、ホロジュール、Holodex、公式タレント一覧からデータを取得します。
- 検索、カテゴリ絞り込み、タレント別ページ、ダークモード、RSS、sitemap、robotsを実装済み。
- GitHub Pages向けに6時間ごとの自動更新とデプロイを用意しています。

## 必要環境

Node.js 24以上を使います。

```bash
npm install
```

任意で `.env.example` を参考に環境変数を設定します。

```bash
cp .env.example .env
```

Holodex APIキーがなくても、ホロジュール由来の配信データでビルドは継続します。

## 開発

```bash
npm run fetch:data
npm run dev
```

ローカル確認:

```bash
npm run health
npm run check:search
npm run check:links
```

## ビルド

```bash
npm run build
```

ビルド時に `src/data/generated/` のJSONを更新し、`dist/` に静的サイトを生成します。

## データ取得

主な取得元:

- 公式ニュース: `https://hololive.hololivepro.com/wp-sitemap-posts-news-1.xml`
- 公式ショップ: `https://shop.hololivepro.com/products.json`
- 配信予定: `https://schedule.hololive.tv/api/list`
- 配信補完: Holodex API
- タレント画像: `https://hololive.hololivepro.com/talents/`

外部取得には既定で15秒のタイムアウトを設定しています。変更する場合は `FETCH_TIMEOUT_MS` をミリ秒で指定してください。

公式サイトやAPIが一時的に失敗した場合、前回生成済みの `news.json`、`products.json`、`streams.json`、`official-talents.json` を再利用してビルドを継続します。この場合 `npm run health` では対象データが「前回データ」として表示されます。

## GitHub Pages公開

`.github/workflows/update-and-deploy.yml` が次のタイミングでビルドとデプロイを実行します。

- `main` / `master` へのpush
- 手動実行
- 6時間ごとの定期実行

リポジトリ設定:

1. GitHub PagesのBuild and deploymentを `GitHub Actions` にする。
2. Repository Secretsに任意で `HOLODEX_API_KEY` を設定する。
3. `main` または `master` にpushする。

GitHub Actionsでは次の環境変数を自動設定します。

- `BASE_PATH`: `/${{ github.event.repository.name }}/`
- `SITE_URL`: `https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}`
- `HOLODEX_API_KEY`: Repository Secretsの値

独自ドメインで運用する場合は、`SITE_URL` と `BASE_PATH` の扱いをデプロイ先に合わせて変更してください。

## 運用確認

```bash
npm run health
```

確認できる内容:

- 最終生成時刻
- 取得タイムアウト
- ニュース件数
- 商品件数
- 配信件数
- 公式タレント件数
- ポータル統合件数

公開後に表示件数が急に減ったり配信情報が止まった場合は、まず `npm run health` で `Streams`、`News`、`Products`、`Official talents` のどこに問題が出ているかを確認します。

## 公開前チェックリスト

- `npm run build` が通る。
- `npm run health` が `OK` または想定済みの `前回データ` になっている。
- `npm run check:search` が通る。
- `npm run check:links` が通る。
- `src/data/links.json` の `affiliateEnabled` が意図した値になっている。
- GitHub Secretsに `HOLODEX_API_KEY` を設定したか確認する。
- GitHub Pagesの公開元がGitHub Actionsになっている。

## マイルストーン

今後の開発方針は [docs/milestones.md](docs/milestones.md) を参照してください。

## Codex / GitHub Copilot 併用

トークン消費を抑えるため、実装はGitHub Copilotに小さく渡し、Codexは設計・レビュー・難所判断に寄せます。

- 設計概要: [docs/architecture.md](docs/architecture.md)
- 開発手順: [docs/development.md](docs/development.md)
- Copilot向けタスク: [docs/copilot-tasks.md](docs/copilot-tasks.md)
