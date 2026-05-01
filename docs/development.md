# Development Guide

This document is for Codex, GitHub Copilot, and human contributors working on Holo Portal.

## Local Setup

Use Node.js 24 or newer.

```bash
npm install
cp .env.example .env
```

`HOLODEX_API_KEY` is optional. Without it, stream data still uses Holo Schedule.

## Common Commands

```bash
npm run fetch:data
npm run dev
npm run build
npm run health
npm run check:search
npm run check:links
```

For documentation-only changes, build is not always necessary. For data, page, or script changes, run at least:

```bash
npm run check:search
npx astro build
```

Use `npm run build` before release when external fetching is behaving normally. If external sources hang or fail, use `npm run health` and `npx astro build` to verify the currently generated dataset.

## Coding Rules

- Keep changes scoped to the requested milestone/task.
- Do not reformat unrelated files.
- Do not commit secrets, API keys, `.env`, `dist/`, `node_modules/`, `.astro/`, or editor swap files.
- Use generated data shape consistently instead of introducing ad hoc fields.
- Add or update regression checks when changing search/filter/data behavior.
- Keep customer-facing text in Japanese unless it is a brand/service/talent name.
- Keep affiliate behavior disabled unless the task explicitly says to enable it.

## Data Rules

- `src/data/generated/` is committed so the static build can work from the latest known data.
- `scripts/fetch-data.mjs` is the source of truth for normalized data shape.
- If a new field is needed, update the producer script and all affected consumers together.
- If talent detection changes, update `scripts/check-search.mjs`.
- If a data source can fail, keep fallback behavior so builds continue using previous generated data.

## GitHub Pages Release Checklist

Before pushing to `main` or `master`:

- `npm run health`
- `npm run check:search`
- `npm run check:links`
- `npx astro build` or `npm run build`
- Confirm `src/data/links.json` has the intended affiliate setting.
- Confirm no secret values are present with `rg "HOLODEX_API_KEY|apikey|c2600302" . -g '!node_modules' -g '!dist'`.

GitHub repository settings:

- Pages source: GitHub Actions.
- Optional secret: `HOLODEX_API_KEY`.

## Copilot Workflow

1. Read `docs/architecture.md`.
2. Pick one task from `docs/copilot-tasks.md`.
3. Implement only that task.
4. Run the task-specific verification.
5. Leave a concise summary of files changed, behavior changed, and commands run.

Large design decisions, source policy decisions, and monetization decisions should go back to Codex/user review before implementation.
