import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)(?:="([^"]*)")?/g)) {
    result[match[1]] = match[2] == null ? true : decodeHtml(match[2]);
  }
  return result;
}

function extractCards(html, marker) {
  return [...html.matchAll(/<a\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => tag.includes(marker))
    .map(attrs);
}

function countText(cards, query) {
  const normalized = query.toLowerCase();
  return cards.filter((card) => (card["data-search"] || "").toLowerCase().includes(normalized)).length;
}

function countTalent(cards, talent) {
  return cards.filter((card) => (card["data-talents"] || "").includes(talent)).length;
}

const goodsHtml = await readFile(path.join(root, "dist/goods/index.html"), "utf8");
const streamsHtml = await readFile(path.join(root, "dist/streams/index.html"), "utf8");
const goodsCards = extractCards(goodsHtml, "data-product-card");
const streamCards = extractCards(streamsHtml, "data-stream-card");

const checks = [
  ["goods", "宝鐘マリン", countText(goodsCards, "宝鐘マリン")],
  ["goods", "Houshou Marine", countText(goodsCards, "Houshou Marine")],
  ["streams", "宝鐘マリン", countText(streamCards, "宝鐘マリン")],
  ["streams", "Houshou Marine", countText(streamCards, "Houshou Marine")],
  ["streams talent filter", "宝鐘マリン", countTalent(streamCards, "宝鐘マリン")]
];

let failed = false;
for (const [page, query, count] of checks) {
  console.log(`${page}: ${query} -> ${count}`);
  if (count <= 0) failed = true;
}

if (failed) {
  console.error("Search regression check failed.");
  process.exit(1);
}
