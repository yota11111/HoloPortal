import meta from "../data/generated/meta.json";
import items from "../data/generated/portal-items.json";
import { absoluteUrl, escapeXml, responseXml } from "../lib/feed-utils.mjs";

function itemDate(item) {
  return item.startAt || item.createdAt || item.publishedAt || meta.generatedAt;
}

export function GET({ site }) {
  const feedItems = items
    .filter((item) => item.normalUrl)
    .sort((a, b) => itemDate(b).localeCompare(itemDate(a)))
    .slice(0, 50);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Holo Portal</title>
    <link>${escapeXml(absoluteUrl(site, ""))}</link>
    <description>ホロライブ関連の配信、公式ニュース、グッズ情報を整理する非公式フィードです。</description>
    <language>ja</language>
    <lastBuildDate>${new Date(meta.generatedAt).toUTCString()}</lastBuildDate>
${feedItems
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.normalUrl)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${new Date(itemDate(item)).toUTCString()}</pubDate>
      <description>${escapeXml(item.summary || item.source || "")}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

  return responseXml(body);
}
