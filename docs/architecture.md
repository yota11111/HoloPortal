# Architecture

Holo Portal is a static Astro site. It fetches official and public data at build time, writes normalized JSON into `src/data/generated/`, and renders pages from those generated files.

## Runtime Model

- Static site output lives in `dist/`.
- Data fetching happens before build through `npm run fetch:data`.
- `npm run build` runs `fetch:data` and then `astro build`.
- GitHub Pages deployment runs from `.github/workflows/update-and-deploy.yml`.
- Client-side JavaScript is used only for local filtering and theme switching.

## Data Flow

1. `scripts/fetch-data.mjs` fetches external sources.
2. Raw source data is normalized into generated JSON files.
3. Pages import generated JSON directly.
4. Pages render static HTML.
5. Small inline scripts provide search/filter interactions.

Generated files:

- `src/data/generated/news.json`
- `src/data/generated/products.json`
- `src/data/generated/streams.json`
- `src/data/generated/official-talents.json`
- `src/data/generated/portal-items.json`
- `src/data/generated/meta.json`

## External Sources

- Official news sitemap: hololive production news sitemap.
- Official shop: public Shopify product JSON.
- Streams: Holo Schedule API, optionally enriched with Holodex API.
- Official talent images: official hololive talents page image URLs.

Do not download and redistribute official talent images. The site should reference official image URLs with `referrerpolicy="no-referrer"` where appropriate.

## Core Files

- `scripts/fetch-data.mjs`: fetches and normalizes data.
- `scripts/report-health.mjs`: prints data source status and counts.
- `scripts/check-search.mjs`: regression checks for search/filter behavior.
- `scripts/check-links.mjs`: spot-checks official links.
- `src/lib/talent-aliases.mjs`: canonical talent name and alias mapping.
- `src/lib/talent-categories.mjs`: talent group/category mapping.
- `src/lib/talent-data.mjs`: builds talent profile aggregates.
- `src/data/links.json`: affiliate switch and disclosure text.
- `src/components/Seo.astro`: SEO metadata and early theme initialization.
- `src/components/ThemeToggle.astro`: light/dark mode toggle.
- `src/styles/global.css`: shared site styles.

## Pages

- `/`: overview and latest items.
- `/streams/`: stream listing with text, status, and talent filters.
- `/goods/`: product listing with text and category filters.
- `/events/`: live/event/music announcement listing.
- `/talents/`: talent listing with text and category filters.
- `/talents/[slug]/`: talent-specific stream, goods, announcements, and archive page.
- `/rss.xml`, `/sitemap.xml`, `/robots.txt`: generated SEO endpoints.

## Design Constraints

UI work is handled separately. Functional changes should avoid large visual rewrites unless the task explicitly asks for them.

When adding UI:

- Reuse existing classes and patterns in `global.css`.
- Keep filters searchable and keyboard-friendly.
- Do not add customer-visible operational/debug status pages.
- Keep affiliate disclosure visible if affiliate links are ever enabled.

## Safety and Rights

- Keep the site clearly unofficial.
- Prefer official links over scraped copies.
- Avoid storing official images locally unless there is explicit permission.
- Do not enable affiliate links until disclosure, link handling, and policy checks are complete.
