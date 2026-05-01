#!/usr/bin/env node
/**
 * Data quality check script
 * Validates that generated datasets are not obviously broken before deploy
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const metaPath = path.join(__dirname, "../src/data/generated/meta.json");
const portalItemsPath = path.join(__dirname, "../src/data/generated/portal-items.json");

let failed = false;

// Read meta.json
let meta;
try {
  const metaContent = fs.readFileSync(metaPath, "utf-8");
  meta = JSON.parse(metaContent);
} catch (err) {
  console.error(`Failed to read meta.json: ${err.message}`);
  process.exit(1);
}

// Check core datasets are not empty
const coreDatasets = ["news", "products", "streams", "officialTalents"];
for (const dataset of coreDatasets) {
  const info = meta.datasets?.[dataset];
  const count = info?.count;
  if (!Number.isFinite(count) || count <= 0) {
    console.error(`Dataset '${dataset}' has invalid count: ${count ?? "missing"}`);
    failed = true;
  } else {
    console.log(`${dataset}: ${count} items`);
  }
}

// Check portalItems consistency
let portalItemsCount = 0;
try {
  const portalContent = fs.readFileSync(portalItemsPath, "utf-8");
  const portalItems = JSON.parse(portalContent);
  if (Array.isArray(portalItems)) {
    portalItemsCount = portalItems.length;
  } else {
    console.error("portal-items.json is not an array");
    failed = true;
  }
} catch (err) {
  console.error(`Failed to read or parse portal-items.json: ${err.message}`);
  failed = true;
}

const news = Number.isFinite(meta.datasets?.news?.count) ? meta.datasets.news.count : 0;
const products = Number.isFinite(meta.datasets?.products?.count) ? meta.datasets.products.count : 0;
const streams = Number.isFinite(meta.datasets?.streams?.count) ? meta.datasets.streams.count : 0;
const expectedMinimum = news + products + streams;

// portalItems should be roughly the sum of its sources
// Allow up to 20% variance for deduplication/filtering
const minAcceptable = Math.floor(expectedMinimum * 0.8);
if (portalItemsCount < minAcceptable && expectedMinimum > 0) {
  console.error(
    `portalItems count (${portalItemsCount}) is suspiciously low compared to news+products+streams (${expectedMinimum})`
  );
  failed = true;
} else if (portalItemsCount > 0) {
  console.log(`portalItems: ${portalItemsCount} items (sum of sources: ~${expectedMinimum})`);
}

console.log("");

if (failed) {
  console.error("Data quality check failed");
  process.exit(1);
} else {
  console.log("Data quality check passed");
  process.exit(0);
}
