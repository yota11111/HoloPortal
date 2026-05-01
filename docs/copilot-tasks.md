# Copilot Task Queue

These tasks are designed to be handed to GitHub Copilot with minimal extra context. Each task should be implemented as a small, reviewable change.

## How To Use

Give Copilot one task at a time. After Copilot finishes, ask Codex only for a focused review of the diff and the verification output.

Suggested prompt shape:

```text
Read docs/architecture.md and docs/development.md.
Implement task <TASK-ID> from docs/copilot-tasks.md.
Only change files listed in the task unless necessary.
Run the verification commands and summarize the result.
```

## Task Format

- Owner: Copilot or Codex.
- Goal: what should change.
- Files: expected write scope.
- Acceptance: objective completion criteria.
- Verify: commands to run.

## M1.5-C1: Add Data Quality Check Script

Owner: Copilot

Goal: Add a `check:data` script that catches obviously broken generated datasets before deploy.

Files:

- `scripts/check-data.mjs`
- `package.json`
- `.github/workflows/update-and-deploy.yml`
- `docs/development.md`

Acceptance:

- Script reads `src/data/generated/meta.json`.
- Script fails if `news`, `products`, `streams`, or `officialTalents` count is `0`.
- Script fails if `portalItems` is less than the sum of news/products/streams by an obviously impossible margin.
- Script prints clear Japanese or concise English diagnostics.
- GitHub Actions runs `npm run check:data` after `npm run health`.

Verify:

```bash
npm run health
npm run check:data
```

## M2-C1: Expand Talent Alias Regression Cases

Owner: Copilot

Goal: Improve confidence that Japanese and English talent names find the same records.

Files:

- `src/lib/talent-aliases.mjs`
- `scripts/check-search.mjs`

Acceptance:

- Add representative aliases for JP, EN, ID, DEV_IS, HOLOSTARS JP, and HOLOSTARS EN.
- Add search regression cases for at least 8 talents across groups.
- Existing checks still pass.

Verify:

```bash
npm run check:search
```

## M2-C2: Improve Talent Category Mapping

Owner: Copilot

Goal: Make talent categories more complete and easier to maintain.

Files:

- `src/lib/talent-categories.mjs`
- `scripts/check-search.mjs` or a new focused check script if needed

Acceptance:

- Category mapping includes official names, English names, and common aliases where available.
- Each displayed talent maps to exactly one category.
- Category counts remain visible on `/talents/`.
- Add a lightweight regression check that category values exist for all generated talent profiles.

Verify:

```bash
npm run check:search
npx astro build
```

## M2-C3: Improve News Category Rules

Owner: Copilot

Goal: Reduce obvious misclassification in official news categories.

Files:

- `scripts/fetch-data.mjs`
- `scripts/check-data.mjs` if M1.5-C1 exists
- Optional: `docs/development.md`

Acceptance:

- Add clearer keyword groups for live/event/goods/music/news classification.
- Keep multiple categories where a news item genuinely fits multiple areas.
- Do not remove existing fallback behavior.

Verify:

```bash
npm run fetch:data
npm run health
npx astro build
```

## M3-C1: Add Site-Wide Search Page

Owner: Copilot

Goal: Add `/search/` to search across portal items, streams, goods, and talents.

Files:

- `src/pages/search.astro`
- `src/styles/global.css`
- `src/pages/sitemap.xml.js`
- Optional helper in `src/lib/`

Acceptance:

- Supports `?q=` query parameter.
- Searches title, summary, talent names, aliases, categories, and source labels.
- Displays result type and date.
- Links results to the correct target page or official URL.
- Empty state is clear.

Verify:

```bash
npx astro build
```

## M3-C2: Add Query Parameter Support To Listing Filters

Owner: Copilot

Goal: Make listing pages shareable with filter state.

Files:

- `src/pages/goods.astro`
- `src/pages/streams.astro`
- `src/pages/talents.astro`

Acceptance:

- `/goods/?q=...` initializes product search.
- `/streams/?q=...&status=...&talent=...` initializes stream filters.
- `/talents/?q=...&category=...` initializes talent filters.
- Changing filters updates the URL with `history.replaceState`.
- Existing search behavior still works.

Verify:

```bash
npm run check:search
npx astro build
```

## M4-C1: Add CI Summary Output

Owner: Copilot

Goal: Make GitHub Actions logs easier to read.

Files:

- `.github/workflows/update-and-deploy.yml`
- `scripts/report-health.mjs`

Acceptance:

- Health output is appended to GitHub Actions step summary when running in CI.
- Local `npm run health` output remains readable.

Verify:

```bash
npm run health
```

## M5-C1: Improve SEO Metadata Coverage

Owner: Copilot

Goal: Improve metadata consistency across pages.

Files:

- `src/components/Seo.astro`
- page files under `src/pages/`

Acceptance:

- Every public page has a specific title and description.
- `og:image` has a safe fallback.
- Talent detail pages use talent image when available.
- No customer-facing operational text is introduced.

Verify:

```bash
npx astro build
```

## M6-C1: Prepare Affiliate Disclosure Component

Owner: Copilot, after Codex/user approval

Goal: Add disabled-by-default affiliate disclosure plumbing without enabling affiliate links.

Files:

- `src/components/AffiliateDisclosure.astro`
- `src/data/links.json`
- page files that show official outbound links

Acceptance:

- If `affiliateEnabled` is false, current disclosure remains no-affiliate.
- If true, pages show a clear disclosure before outbound commercial links.
- No affiliate URL replacement is enabled unless explicitly approved.

Verify:

```bash
npx astro build
```

## Codex-Only Tasks

These should not be delegated directly to Copilot without review:

- Decide whether an external source is allowed and stable enough to use.
- Review monetization policy and affiliate disclosure wording.
- Decide official image/link handling policy.
- Diagnose complex data loss or source schema changes.
- Final review before public release.
