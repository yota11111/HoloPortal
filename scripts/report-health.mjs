import { appendFile, readFile } from "node:fs/promises";
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

const rows = [];
const output = [];

function print(value = "") {
  output.push(value);
}

function line(name, status, count, message) {
  const countText = Number.isFinite(count) ? `${count.toLocaleString("ja-JP")}件` : "-";
  const statusText = label(status);
  rows.push({ name, status: statusText, count: countText, message });
  print(`${name}: ${statusText} / ${countText}`);
  if (message) print(`  ${message}`);
}

function markdownEscape(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

async function appendStepSummary(meta) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;

  const summary = [
    "## Holo Portal Health",
    "",
    `- Generated: ${meta.generatedAt}`,
    `- Fetch timeout: ${meta.fetch?.timeoutMs || "default"}ms`,
    `- Portal items: ${(meta.counts?.portalItems || 0).toLocaleString("ja-JP")}件`,
    "",
    "| Dataset | Status | Count | Message |",
    "| --- | --- | ---: | --- |",
    ...rows.map((row) => `| ${markdownEscape(row.name)} | ${markdownEscape(row.status)} | ${markdownEscape(row.count)} | ${markdownEscape(row.message || "")} |`),
    ""
  ].join("\n");

  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}

const meta = JSON.parse(await readFile(metaPath, "utf8"));
const datasets = meta.datasets || {};

print("Holo Portal health");
print(`Generated: ${meta.generatedAt}`);
print(`Fetch timeout: ${meta.fetch?.timeoutMs || "default"}ms`);
print("");
line("News", datasets.news?.status || "unknown", meta.counts?.news, datasets.news?.message);
line("Products", datasets.products?.status || "unknown", meta.counts?.products, datasets.products?.message);
line("Streams", datasets.streams?.status || meta.streams?.status || "unknown", meta.counts?.streams, datasets.streams?.message || meta.streams?.message);
line("Official talents", datasets.officialTalents?.status || "unknown", datasets.officialTalents?.count, datasets.officialTalents?.message);
print("");
print(`Portal items: ${(meta.counts?.portalItems || 0).toLocaleString("ja-JP")}件`);

console.log(output.join("\n"));
await appendStepSummary(meta);
