import { absoluteUrl, responseText } from "../lib/feed-utils.mjs";

export function GET({ site }) {
  return responseText(`User-agent: *
Allow: /

Sitemap: ${absoluteUrl(site, "sitemap.xml")}
`);
}
