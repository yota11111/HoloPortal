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

function hasSearchIndex(cards) {
  return cards.some((card) => (card["data-search"] || "").trim().length > 0);
}

const goodsHtml = await readFile(path.join(root, "dist/goods/index.html"), "utf8");
const streamsHtml = await readFile(path.join(root, "dist/streams/index.html"), "utf8");
const goodsCards = extractCards(goodsHtml, "data-product-card");
const streamCards = extractCards(streamsHtml, "data-stream-card");

const requiredChecks = [
  ["goods", "Houshou Marine", countText(goodsCards, "Houshou Marine")],
  ["goods", "Marine", countText(goodsCards, "Marine")],
  ["goods", "Takanashi Kiara", countText(goodsCards, "Takanashi Kiara")],
  ["goods", "Kiara", countText(goodsCards, "Kiara")],
  ["goods", "Ninomae Ina'nis", countText(goodsCards, "Ninomae Ina'nis")],
  ["goods", "Pavolia Reine", countText(goodsCards, "Pavolia Reine")],
  ["goods", "Kobo Kanaeru", countText(goodsCards, "Kobo Kanaeru")],
  ["goods", "Ichijou Ririka", countText(goodsCards, "Ichijou Ririka")],
  ["goods", "Juufuutei Raden", countText(goodsCards, "Juufuutei Raden")],
  ["goods", "Yukoku Roberu", countText(goodsCards, "Yukoku Roberu")],
  ["goods", "Jurard T Rexford", countText(goodsCards, "Jurard T Rexford")]
];

const liveDataChecks = [
  ["streams", "Houshou Marine", countText(streamCards, "Houshou Marine")],
  ["streams talent filter", "Houshou Marine", countTalent(streamCards, "Houshou Marine")],
  ["streams", "Takanashi Kiara", countText(streamCards, "Takanashi Kiara")],
  ["streams talent filter", "Takanashi Kiara", countTalent(streamCards, "Takanashi Kiara")],
  ["streams", "Pavolia Reine", countText(streamCards, "Pavolia Reine")],
  ["streams talent filter", "Pavolia Reine", countTalent(streamCards, "Pavolia Reine")],
  ["streams", "Kobo Kanaeru", countText(streamCards, "Kobo Kanaeru")],
  ["streams talent filter", "Kobo Kanaeru", countTalent(streamCards, "Kobo Kanaeru")],
  ["streams", "Ichijou Ririka", countText(streamCards, "Ichijou Ririka")],
  ["streams talent filter", "Ichijou Ririka", countTalent(streamCards, "Ichijou Ririka")],
  ["streams", "Juufuutei Raden", countText(streamCards, "Juufuutei Raden")],
  ["streams talent filter", "Juufuutei Raden", countTalent(streamCards, "Juufuutei Raden")],
  ["streams", "Yukoku Roberu", countText(streamCards, "Yukoku Roberu")],
  ["streams talent filter", "Yukoku Roberu", countTalent(streamCards, "Yukoku Roberu")],
  ["streams", "Jurard T Rexford", countText(streamCards, "Jurard T Rexford")],
  ["streams talent filter", "Jurard T Rexford", countTalent(streamCards, "Jurard T Rexford")]
];

let failed = false;

if (goodsCards.length <= 0) {
  console.error("No goods cards found.");
  failed = true;
}

if (streamCards.length <= 0) {
  console.error("No stream cards found.");
  failed = true;
}

if (!hasSearchIndex(goodsCards)) {
  console.error("Goods cards do not include a searchable data-search index.");
  failed = true;
}

if (!hasSearchIndex(streamCards)) {
  console.error("Stream cards do not include a searchable data-search index.");
  failed = true;
}

for (const [page, query, count] of requiredChecks) {
  console.log(`${page}: ${query} -> ${count}`);
  if (count <= 0) failed = true;
}

for (const [page, query, count] of liveDataChecks) {
  const line = `${page}: ${query} -> ${count}`;
  if (count <= 0) {
    console.warn(`${line} (warning: current live data has no matching stream card)`);
  } else {
    console.log(line);
  }
}

if (failed) {
  console.error("Search regression check failed.");
  process.exit(1);
}

console.log("Search regression check passed.");
