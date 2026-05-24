import { createHmac, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const TWEET_ENDPOINT = "https://api.x.com/2/tweets";
const MAX_POST_LENGTH = 280;
const UTM_SOURCE = "x";
const UTM_MEDIUM = "social";

await loadDotEnv();

const siteUrl = normalizedSiteUrl(process.env.SITE_URL || "https://holo-portal.com");
const todayKey = dateKeyJst(new Date());
const todayUrl = buildUrl(siteUrl, "/today/", {
  utm_source: UTM_SOURCE,
  utm_medium: UTM_MEDIUM,
  utm_campaign: `daily_digest_${todayKey.replaceAll("-", "")}`
});

const [portalItems, streams, meta] = await Promise.all([
  readGeneratedJson("portal-items.json", []),
  readGeneratedJson("streams.json", []),
  readGeneratedJson("meta.json", null)
]);

const digestResult = buildDigest({ portalItems, streams, meta, todayKey, todayUrl, now: new Date() });

if (digestResult.skipReason) {
  console.log(`X digest skipped: ${digestResult.skipReason}`);
  console.log(todayUrl);
  process.exit(0);
}

const digest = digestResult.text;

if (process.env.X_POST_ENABLED !== "true") {
  console.log("X posting is disabled. Dry-run digest:");
  console.log("");
  console.log(digest);
  console.log("");
  console.log("Set X_POST_ENABLED=true and X OAuth credentials to post.");
  process.exit(0);
}

validateXCredentials();

const response = await fetch(TWEET_ENDPOINT, {
  method: "POST",
  headers: {
    Authorization: oauthHeader("POST", TWEET_ENDPOINT),
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ text: digest })
});

const body = await response.text();

if (!response.ok) {
  throw new Error(`X post failed: ${response.status} ${response.statusText}\n${body}`);
}

console.log("Posted daily digest to X.");
console.log(body);

async function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  let text;

  try {
    text = await readFile(envPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = unquoteEnvValue(rawValue);
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function readGeneratedJson(fileName, fallback) {
  const filePath = path.join(process.cwd(), "src/data/generated", fileName);

  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function buildDigest({ portalItems, streams, meta, todayKey, todayUrl, now }) {
  const todaysStreams = uniqueBy(
    streams.filter((stream) => dateKeyJst(stream.startAt || stream.scheduledAt) === todayKey),
    (stream) => stream.youtubeUrl || stream.holodexUrl || stream.id
  ).sort(compareStreamTime);

  const todaysAnnouncements = portalItems.filter((item) => {
    if (item.category === "stream") return false;
    const itemDate = item.startAt || item.publishedAt || item.date;
    return dateKeyJst(itemDate) === todayKey;
  });

  const categorySummary = summarizeAnnouncements(todaysAnnouncements);
  const featuredStream = pickFeaturedStream(todaysStreams, now);
  const featuredAnnouncement = todaysAnnouncements[0];
  const staleData = hasStaleData(meta);
  const latestContentKey = latestDateKey([...portalItems, ...streams]);

  if (staleData && todaysStreams.length === 0 && todaysAnnouncements.length === 0) {
    return {
      skipReason: "latest fetch reused stale data and no same-day items were found"
    };
  }

  if (latestContentKey && latestContentKey < todayKey && todaysStreams.length === 0 && todaysAnnouncements.length === 0) {
    return {
      skipReason: `newest generated item is ${latestContentKey}, so same-day digest would be empty`
    };
  }

  const dateLabel = formatJstDateLabel(todayKey);
  const lines = [
    `Holo Portal ${dateLabel}のホロライブまとめ`,
    "",
    `本日の配信予定: ${todaysStreams.length}件`,
    todaysAnnouncements.length > 0
      ? `公式発表: ${todaysAnnouncements.length}件${categorySummary ? ` (${categorySummary})` : ""}`
      : null,
    featuredStream ? formatFeaturedStream(featuredStream, now) : null,
    !featuredStream && featuredAnnouncement ? `注目: ${featuredAnnouncement.title}` : null,
    "",
    "配信・グッズ・イベント・音楽を一覧で確認できます。",
    "#ホロライブ #HoloPortal",
    todayUrl
  ].filter((line) => line !== null);

  return {
    text: truncatePost(lines.join("\n"), MAX_POST_LENGTH)
  };
}

function hasStaleData(meta) {
  if (!meta) return false;
  const datasetStatuses = Object.values(meta.datasets || {}).map((dataset) => dataset?.status);
  return datasetStatuses.some((status) => status && status !== "ok") || meta.streams?.status === "stale";
}

function latestDateKey(values) {
  return values
    .map((value) => value?.startAt || value?.scheduledAt || value?.createdAt || value?.publishedAt)
    .filter(Boolean)
    .map(dateKeyJst)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function compareStreamTime(left, right) {
  return streamTime(left) - streamTime(right);
}

function streamTime(stream) {
  const value = stream.startAt || stream.scheduledAt;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : Number.MAX_SAFE_INTEGER;
}

function summarizeAnnouncements(items) {
  const labels = {
    goods: "グッズ",
    event: "イベント",
    live: "ライブ",
    music: "音楽",
    news: "ニュース"
  };
  const counts = new Map();

  for (const item of items) {
    const label = labels[item.category] || "その他";
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => `${label}${count}`)
    .join(" / ");
}

function pickFeaturedStream(streams, now) {
  const nowTime = now.getTime();
  return streams.find((stream) => streamTime(stream) >= nowTime) || streams[0] || null;
}

function formatFeaturedStream(stream, now) {
  const startsAt = streamTime(stream);
  const prefix = startsAt >= now.getTime()
    ? `このあと ${formatJstTime(startsAt)}`
    : "注目の配信";

  return `${prefix}: ${stream.title}`;
}

function formatJstDateLabel(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatJstTime(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function truncatePost(text, maxLength) {
  if (countCodePoints(text) <= maxLength) return text;

  const marker = "...";
  const lines = text.split("\n");
  const url = lines.at(-1);
  const prefixLimit = maxLength - countCodePoints(url) - countCodePoints(marker) - 2;
  const prefix = truncateCodePoints(lines.slice(0, -1).join("\n"), prefixLimit);

  return `${prefix}${marker}\n${url}`;
}

function truncateCodePoints(value, maxLength) {
  return [...String(value)].slice(0, Math.max(0, maxLength)).join("");
}

function countCodePoints(value) {
  return [...String(value)].length;
}

function dateKeyJst(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function uniqueBy(items, keyFn) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizedSiteUrl(value) {
  return String(value).replace(/\/+$/, "");
}

function buildUrl(origin, pathname, params) {
  const url = new URL(pathname, `${origin}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function validateXCredentials() {
  const required = [
    "X_API_KEY",
    "X_API_SECRET",
    "X_ACCESS_TOKEN",
    "X_ACCESS_TOKEN_SECRET"
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing X credentials: ${missing.join(", ")}`);
  }
}

function oauthHeader(method, url) {
  const oauthParams = {
    oauth_consumer_key: process.env.X_API_KEY,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN,
    oauth_version: "1.0"
  };

  const signingParams = new URLSearchParams(oauthParams);
  const parameterString = [...signingParams.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");

  const signatureBase = [
    method.toUpperCase(),
    encodeRfc3986(url),
    encodeRfc3986(parameterString)
  ].join("&");
  const signingKey = `${encodeRfc3986(process.env.X_API_SECRET)}&${encodeRfc3986(process.env.X_ACCESS_TOKEN_SECRET)}`;
  const signature = createHmac("sha1", signingKey).update(signatureBase).digest("base64");

  return `OAuth ${Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeRfc3986(key)}="${encodeRfc3986(value)}"`)
    .join(", ")}`;
}

function encodeRfc3986(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}
