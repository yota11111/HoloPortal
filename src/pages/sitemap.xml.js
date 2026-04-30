import items from "../data/generated/portal-items.json";
import streams from "../data/generated/streams.json";
import officialTalents from "../data/generated/official-talents.json";
import { buildTalentProfiles } from "../lib/talent-data.mjs";
import { absoluteUrl, escapeXml, responseXml } from "../lib/feed-utils.mjs";

const staticPages = [
  { path: "", priority: "1.0", changefreq: "hourly" },
  { path: "streams/", priority: "0.9", changefreq: "hourly" },
  { path: "goods/", priority: "0.8", changefreq: "daily" },
  { path: "events/", priority: "0.8", changefreq: "daily" },
  { path: "talents/", priority: "0.8", changefreq: "daily" }
];

function latestDate(values) {
  const latest = values
    .map((value) => value?.startAt || value?.createdAt || value?.publishedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
  return latest ? new Date(latest).toISOString() : new Date().toISOString();
}

export function GET({ site }) {
  const profiles = buildTalentProfiles(items, streams, officialTalents);
  const generatedAt = latestDate([...items, ...streams]);
  const urls = [
    ...staticPages.map((page) => ({
      loc: absoluteUrl(site, page.path),
      lastmod: generatedAt,
      changefreq: page.changefreq,
      priority: page.priority
    })),
    ...profiles.map((profile) => ({
      loc: absoluteUrl(site, `talents/${profile.slug}/`),
      lastmod: profile.latestAt ? new Date(profile.latestAt).toISOString() : generatedAt,
      changefreq: "daily",
      priority: profile.counts.streams > 0 ? "0.7" : "0.6"
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return responseXml(body);
}
