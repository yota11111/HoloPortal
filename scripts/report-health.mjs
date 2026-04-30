import { readFile } from "node:fs/promises";
import path from "node:path";

const metaPath = path.join(process.cwd(), "src/data/generated/meta.json");

function label(status) {
  if (status === "ok") return "OK";
  if (status === "stale") return "前回データ";
  if (status === "missing_key") return "キーなし";
  if (status === "fetch_failed") return "取得失敗";
  if (status === "error") return "エラー";
  return status || "不明";
}

function line(name, status, count, message) {
  const countText = Number.isFinite(count) ? `${count.toLocaleString("ja-JP")}件` : "-";
  console.log(`${name}: ${label(status)} / ${countText}`);
  if (message) console.log(`  ${message}`);
}

const meta = JSON.parse(await readFile(metaPath, "utf8"));
const datasets = meta.datasets || {};

console.log("Holo Portal health");
console.log(`Generated: ${meta.generatedAt}`);
console.log(`Fetch timeout: ${meta.fetch?.timeoutMs || "default"}ms`);
console.log("");
line("News", datasets.news?.status || "unknown", meta.counts?.news, datasets.news?.message);
line("Products", datasets.products?.status || "unknown", meta.counts?.products, datasets.products?.message);
line("Streams", datasets.streams?.status || meta.streams?.status || "unknown", meta.counts?.streams, datasets.streams?.message || meta.streams?.message);
line("Official talents", datasets.officialTalents?.status || "unknown", datasets.officialTalents?.count, datasets.officialTalents?.message);
console.log("");
console.log(`Portal items: ${(meta.counts?.portalItems || 0).toLocaleString("ja-JP")}件`);
