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
  // JP
  ["goods", "宝鐘マリン", countText(goodsCards, "宝鐘マリン")],
  ["goods", "Houshou Marine", countText(goodsCards, "Houshou Marine")],
  ["goods", "Marine", countText(goodsCards, "Marine")],
  ["streams", "宝鐘マリン", countText(streamCards, "宝鐘マリン")],
  ["streams", "Houshou Marine", countText(streamCards, "Houshou Marine")],
  ["streams talent filter", "宝鐘マリン", countTalent(streamCards, "宝鐘マリン")],

  // EN: current fixture includes goods, streams, and a Japanese canonical talent filter.
  ["goods", "小鳥遊キアラ", countText(goodsCards, "小鳥遊キアラ")],
  ["goods", "Takanashi Kiara", countText(goodsCards, "Takanashi Kiara")],
  ["goods", "Kiara", countText(goodsCards, "Kiara")],
  ["streams", "小鳥遊キアラ", countText(streamCards, "小鳥遊キアラ")],
  ["streams", "Takanashi Kiara", countText(streamCards, "Takanashi Kiara")],
  ["streams talent filter", "小鳥遊キアラ", countTalent(streamCards, "小鳥遊キアラ")],

  // EN: current fixture includes goods for Ina, but no stream cards.
  ["goods", "一伊那尓栖", countText(goodsCards, "一伊那尓栖")],
  ["goods", "Ninomae Ina'nis", countText(goodsCards, "Ninomae Ina'nis")],
  ["goods", "Ina'nis", countText(goodsCards, "Ina'nis")],

  // ID: search supports Japanese aliases, while the talent filter keeps canonical names.
  ["goods", "パヴォリア・レイネ", countText(goodsCards, "パヴォリア・レイネ")],
  ["goods", "Pavolia Reine", countText(goodsCards, "Pavolia Reine")],
  ["goods", "Reine", countText(goodsCards, "Reine")],
  ["streams", "パヴォリア・レイネ", countText(streamCards, "パヴォリア・レイネ")],
  ["streams", "Pavolia Reine", countText(streamCards, "Pavolia Reine")],
  ["streams talent filter", "Pavolia Reine", countTalent(streamCards, "Pavolia Reine")],

  // ID: search supports Japanese aliases, while the talent filter keeps canonical names.
  ["goods", "こぼ・かなえる", countText(goodsCards, "こぼ・かなえる")],
  ["goods", "Kobo Kanaeru", countText(goodsCards, "Kobo Kanaeru")],
  ["goods", "Kobo", countText(goodsCards, "Kobo")],
  ["streams", "こぼ・かなえる", countText(streamCards, "こぼ・かなえる")],
  ["streams", "Kobo Kanaeru", countText(streamCards, "Kobo Kanaeru")],
  ["streams talent filter", "Kobo Kanaeru", countTalent(streamCards, "Kobo Kanaeru")],

  // DEV_IS
  ["goods", "一条莉々華", countText(goodsCards, "一条莉々華")],
  ["goods", "Ichijou Ririka", countText(goodsCards, "Ichijou Ririka")],
  ["goods", "Ririka", countText(goodsCards, "Ririka")],
  ["streams", "一条莉々華", countText(streamCards, "一条莉々華")],
  ["streams", "Ichijou Ririka", countText(streamCards, "Ichijou Ririka")],
  ["streams talent filter", "一条莉々華", countTalent(streamCards, "一条莉々華")],

  // DEV_IS
  ["goods", "儒烏風亭らでん", countText(goodsCards, "儒烏風亭らでん")],
  ["goods", "Juufuutei Raden", countText(goodsCards, "Juufuutei Raden")],
  ["goods", "Raden", countText(goodsCards, "Raden")],
  ["streams", "儒烏風亭らでん", countText(streamCards, "儒烏風亭らでん")],
  ["streams", "Juufuutei Raden", countText(streamCards, "Juufuutei Raden")],
  ["streams talent filter", "儒烏風亭らでん", countTalent(streamCards, "儒烏風亭らでん")],

  // HOLOSTARS JP
  ["goods", "夕刻ロベル", countText(goodsCards, "夕刻ロベル")],
  ["goods", "Yukoku Roberu", countText(goodsCards, "Yukoku Roberu")],
  ["goods", "Roberu", countText(goodsCards, "Roberu")],
  ["streams", "夕刻ロベル", countText(streamCards, "夕刻ロベル")],
  ["streams", "Yukoku Roberu", countText(streamCards, "Yukoku Roberu")],
  ["streams talent filter", "夕刻ロベル", countTalent(streamCards, "夕刻ロベル")],

  // HOLOSTARS EN: search supports Japanese aliases, while the talent filter keeps canonical names.
  ["goods", "ジュラルド・ティー・レクスフォード", countText(goodsCards, "ジュラルド・ティー・レクスフォード")],
  ["goods", "Jurard T Rexford", countText(goodsCards, "Jurard T Rexford")],
  ["goods", "Jurard", countText(goodsCards, "Jurard")],
  ["streams", "ジュラルド・ティー・レクスフォード", countText(streamCards, "ジュラルド・ティー・レクスフォード")],
  ["streams", "Jurard T Rexford", countText(streamCards, "Jurard T Rexford")],
  ["streams talent filter", "Jurard T Rexford", countTalent(streamCards, "Jurard T Rexford")],
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
