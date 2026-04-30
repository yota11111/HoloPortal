import { readFile } from "node:fs/promises";

const items = JSON.parse(
  await readFile(new URL("../src/data/generated/portal-items.json", import.meta.url), "utf8")
);

const sample = items.slice(0, 30);
let failed = 0;

for (const item of sample) {
  try {
    let response = await fetch(item.officialUrl, {
      method: "HEAD",
      headers: { "user-agent": "holo-portal-link-check/0.1" }
    });
    if (!response.ok) {
      response = await fetch(item.officialUrl, {
        method: "GET",
        headers: {
          "range": "bytes=0-1024",
          "user-agent": "holo-portal-link-check/0.1"
        }
      });
    }
    if (response.status >= 400) {
      failed += 1;
      console.error(`${response.status} ${item.officialUrl}`);
    }
  } catch (error) {
    failed += 1;
    console.error(`${item.officialUrl}: ${error.message}`);
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log(`Checked ${sample.length} links.`);
