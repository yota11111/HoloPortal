# Release Checklist

公開後に確認する項目です。

## GitHub

- Repository: https://github.com/yota11111/HoloPortal
- Actions: https://github.com/yota11111/HoloPortal/actions
- Pages URL: https://yota11111.github.io/HoloPortal/

未ログイン状態で上記が404になる場合は、リポジトリがPrivate、またはGitHub Pagesの初回公開が完了していない可能性があります。

## GitHub Actions

1. Repositoryの `Actions` タブを開く。
2. `Update data and deploy` の最新実行を開く。
3. `build` ジョブが成功していることを確認する。
4. `Health check and summary` のSummaryに `Holo Portal Health` が出ていることを確認する。
5. `Data quality check`、`Search regression check`、`Talent category check` が成功していることを確認する。
6. `Deploy to GitHub Pages` が成功していることを確認する。

## GitHub Pages

1. Repositoryの `Settings` → `Pages` を開く。
2. `Build and deployment` のSourceが `GitHub Actions` になっていることを確認する。
3. 公開URLが表示されていることを確認する。
4. 公開URLを開き、以下を確認する。

- `/`
- `/streams/`
- `/goods/`
- `/events/`
- `/talents/`
- `/search/`
- `/rss.xml`
- `/sitemap.xml`

## Site Behavior

- グッズ検索で `宝鐘マリン`、`Houshou Marine`、`Marine` が同じように結果を返す。
- 配信検索でタレント名、ステータス、タレント絞り込みが動く。
- タレント一覧でカテゴリ絞り込みが動く。
- `/search/?q=marine` のようなURL付き検索が動く。
- `affiliateEnabled` が `false` のまま、アフィリエイト未使用表示になっている。

## Search Console

公開URLが安定したら、Google Search Consoleに登録します。

1. URLプレフィックスで `https://yota11111.github.io/HoloPortal/` を登録する。
2. 所有権確認を行う。
3. `sitemap.xml` を送信する。
4. インデックス登録状況を確認する。
