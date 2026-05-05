import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonicalTalentName } from "../src/lib/talent-aliases.mjs";

const outDir = path.join(process.cwd(), "src/data/generated");
const NEWS_SITEMAP = "https://hololive.hololivepro.com/wp-sitemap-posts-news-1.xml";
const SHOP_PRODUCTS = "https://shop.hololivepro.com/products.json?limit=250&page=";
const HOLODEX_LIVE = "https://holodex.net/api/v2/live?org=Hololive&limit=50&max_upcoming_hours=72";
const HOLO_SCHEDULE_LIST = "https://schedule.hololive.tv/api/list";
const OFFICIAL_TALENTS = "https://hololive.hololivepro.com/talents/";
const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 15000);
const NEWS_LIMIT = Number(process.env.NEWS_LIMIT || 80);
const PRODUCT_LIMIT = Number(process.env.PRODUCT_LIMIT || 750);

const talentNames = [
  "ときのそら",
  "星街すいせい",
  "白上フブキ",
  "大神ミオ",
  "猫又おかゆ",
  "戌神ころね",
  "兎田ぺこら",
  "白銀ノエル",
  "宝鐘マリン",
  "天音かなた",
  "角巻わため",
  "常闇トワ",
  "獅白ぼたん",
  "尾丸ポルカ",
  "ラプラス・ダークネス",
  "鷹嶺ルイ",
  "博衣こより",
  "風真いろは",
  "火威青",
  "音乃瀬奏",
  "一条莉々華",
  "儒烏風亭らでん",
  "轟はじめ",
  "響咲リオナ",
  "虎金妃笑虎",
  "水宮枢",
  "輪堂千速",
  "綺々羅々ヴィヴィ",
  "小鳥遊キアラ",
  "一伊那尓栖",
  "AZKi",
  "ReGLOSS",
  "秘密結社holoX",
  "ホロライブ3期生",
  "ホロライブ5期生",
  "ホロライブEnglish",
  "ホロライブインドネシア"
];

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, "\"")
    .replace(/&#038;/g, "&")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, "\"")
    .replace(/&#038;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .trim();
}

function toIsoDate(value) {
  return value.replaceAll(".", "-");
}

function monthKey(value) {
  return toIsoDate(value).slice(0, 7);
}

function textMatches(text, pattern) {
  return pattern.test(text);
}

const newsCategoryRules = {
  live: {
    title: /ライブ|LIVE|Live|Concert|コンサート|fes\.|COUNTDOWN|3Dお披露目|生配信|配信チケット|現地会場チケット|有明アリーナ|ぴあアリーナ|Kアリーナ|武道館|ワールドツアー|SuperNova|Departure|SHINier|Flashpoint|Our Sparkle|All for One|Chromatic/i,
    body: /ライブ開催|コンサート開催|配信チケット|現地会場チケット|ライブビューイング|アフター上映|3Dお披露目配信|YouTubeにて配信/i
  },
  goods: {
    title: /グッズ|販売|発売|ショップ|SHOP|POP UP|ポップアップ|フェア|コミックマーケット|C10[0-9]|アパレル|カード|ホロカ|物販|商品|オフィシャルオンラインショップ|official shop/i,
    body: /グッズ販売|販売開始|発売決定|受注販売|物販|商品ラインナップ|購入特典|オフィシャルショップ|official shop|オンラインショップ/i
  },
  event: {
    title: /イベント|EXPO|展覧会|展示|キャンペーン|コラボ|コラボレーション|PARCO|万博|ドジャース|オフィシャルレポート|応援プロジェクト|企画|出展|開催決定/i,
    body: /イベント開催|会場|出展|展示|展覧会|キャンペーン|コラボレーション|来場者特典|オフィシャルレポート/i
  },
  music: {
    title: /アルバム|EP|シングル|リリース|楽曲|Music|RECORDS|主題歌|MV|デジタル配信|リスニングパーティー/i,
    body: /アルバム|EP|シングル|楽曲|デジタル配信|音楽配信|MV公開|リリース決定|hololive RECORDS|リスニングパーティー/i
  }
};

function hasNewsCategory(rule, titleText, bodyText) {
  return textMatches(titleText, rule.title) || textMatches(bodyText, rule.body);
}

function classifyNews(title, body) {
  const titleText = title.replace(/ホロライブ|hololive|HOLOLIVE/g, "");
  const bodyText = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== title)
    .slice(0, 8)
    .join(" ")
    .replace(/ホロライブ|hololive|HOLOLIVE/g, "");
  const categories = [];

  for (const [category, rule] of Object.entries(newsCategoryRules)) {
    if (hasNewsCategory(rule, titleText, bodyText)) categories.push(category);
  }

  return categories.length ? categories : ["news"];
}

function classifyProduct(title, handle) {
  const text = `${title} ${handle}`.replace(/ホロライブ|hololive|HOLOLIVE/g, "");
  const lower = text.toLowerCase();
  if (text.includes("誕生日記念") || lower.includes("birthday")) return "birthday";
  if ((text.includes("活動") && text.includes("周年記念")) || lower.includes("anniversary")) return "anniversary";
  if (text.includes("ボイス") || lower.includes("voice")) return "voice";
  if (/ライブ|LIVE|Concert|fes\.|EXPO|イベント|コミックマーケット|C10[0-9]|SuperNova|Departure|SHINier|Flashpoint|Our Sparkle|All for One|Chromatic|ライブグッズ/.test(text)) {
    return "live_goods";
  }
  if (/friends|ホロフレ|with u|to Go/i.test(text)) return "friends";
  if (/closet|Connect|アパレル|Seasonal|holoAnimArt|PLAYLIST|ホロナツ|Spring Party/i.test(text)) return "series";
  if (/Card|カード|ホロカ/i.test(text)) return "card_book";
  if (/復刻|再販売|rerelease|再受注/i.test(text)) return "resale";
  return "goods";
}

function extractTalents(text) {
  return talentNames.filter((name) => text.includes(name));
}

function extractMetaImage(html) {
  const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  return match ? match[1] : null;
}

function productImage(product) {
  return product.images?.[0]?.src || product.variants?.find((variant) => variant.featured_image)?.featured_image?.src || null;
}

function productPrices(product) {
  return (product.variants || [])
    .map((variant) => Number.parseFloat(String(variant.price ?? "").replace(/,/g, "")))
    .filter((price) => Number.isFinite(price) && price > 0);
}

function newsDateFromUrl(url) {
  const match = url.match(/\/news\/(\d{8})/);
  if (!match) return "";
  return `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`;
}

function makeId(prefix, value) {
  return `${prefix}-${value}`
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9一-龠ぁ-んァ-ヶー]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function youtubeIdFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.replace("/", "") || null;
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function scheduleDateToIso(value) {
  if (!value) return null;
  return `${value.replaceAll("/", "-").replace(" ", "T")}+09:00`;
}

function streamStatusFromSchedule(video) {
  if (video.isLive) return "live";
  const startAt = scheduleDateToIso(video.datetime);
  if (!startAt) return "upcoming";
  return new Date(startAt).getTime() >= Date.now() ? "upcoming" : "past";
}

async function fetchText(url) {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  const headers = {
    "user-agent": "holo-portal/0.1 (+https://example.com; unofficial fan portal)",
    ...(options.headers || {})
  };

  let lastResponse;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      lastResponse = response;
      if (response.ok || ![408, 429, 500, 502, 503, 504].includes(response.status) || attempt === attempts) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
    } finally {
      clearTimeout(timeout);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  if (!lastResponse && lastError) throw lastError;
  return lastResponse;
}

async function fetchHolodexJson(url) {
  const apiKey = process.env.HOLODEX_API_KEY;
  if (!apiKey) {
    return {
      items: [],
      status: "missing_key",
      message: "HOLODEX_API_KEY is not set. Live and upcoming stream data is disabled."
    };
  }

  let response;
  try {
    response = await fetchWithRetry(url, {
      headers: {
        "x-apikey": apiKey
      }
    });
  } catch (error) {
    return {
      items: [],
      status: "fetch_failed",
      message: `Holodex request failed: ${error.message}`
    };
  }

  if (!response.ok) {
    return {
      items: [],
      status: "fetch_failed",
      message: `Holodex request failed: ${response.status}`
    };
  }

  return {
    items: await response.json(),
    status: "ok",
    message: null
  };
}

async function fetchHoloScheduleJson(url) {
  try {
    return {
      items: await fetchJson(url),
      status: "ok",
      message: null
    };
  } catch (error) {
    return {
      items: null,
      status: "fetch_failed",
      message: `Holo Schedule request failed: ${error.message}`
    };
  }
}

async function fetchNews() {
  const sitemap = await fetchText(NEWS_SITEMAP);
  const urls = [...sitemap.matchAll(/<loc>(https:\/\/hololive\.hololivepro\.com\/news\/[^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => !url.includes("/en/") && !url.includes("/id/"))
    .sort((a, b) => newsDateFromUrl(b).localeCompare(newsDateFromUrl(a)))
    .slice(0, NEWS_LIMIT);

  const items = [];
  for (const url of urls) {
    let html;
    try {
      html = await fetchText(url);
    } catch (error) {
      console.warn(`Skipping news item: ${url} (${error.message})`);
      continue;
    }
    const h1 = html.match(/<h1>\s*<span>([^<]+)<\/span>\s*([\s\S]*?)<\/h1>/);
    const article = html.match(/<article class="single_box">([\s\S]*?)<\/article>/);
    if (!h1) continue;

    const date = h1[1].trim();
    const title = stripTags(h1[2]);
    const body = stripTags(article ? article[1] : html);
    const imageUrl = extractMetaImage(html);
    const summary = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line !== date && line !== title)
      .slice(0, 3)
      .join(" ")
      .slice(0, 260);

    items.push({
      id: makeId("news", url),
      source: "official_news",
      categories: classifyNews(title, body),
      title,
      summary,
      imageUrl,
      talents: extractTalents(`${title} ${body}`),
      officialUrl: url,
      publishedAt: toIsoDate(date),
      month: monthKey(date),
      fetchedAt: new Date().toISOString()
    });
  }

  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

async function fetchProducts() {
  const products = [];
  for (let page = 1; page <= 20; page += 1) {
    const payload = await fetchJson(`${SHOP_PRODUCTS}${page}`);
    const pageProducts = payload.products || [];
    if (!pageProducts.length) break;
    products.push(...pageProducts);
    if (pageProducts.length < 250) break;
  }

  const unique = new Map(products.map((product) => [product.id, product]));
  return [...unique.values()]
    .filter((product) => product.created_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, PRODUCT_LIMIT)
    .map((product) => {
      const prices = productPrices(product);
      const title = product.title;
      const handle = product.handle;
      const imageUrl = productImage(product);
      return {
        id: makeId("product", handle),
        source: "official_shop",
        category: classifyProduct(title, handle),
        title,
        imageUrl,
        talents: extractTalents(`${title} ${(product.tags || []).join(" ")}`),
        officialUrl: `https://shop.hololivepro.com/products/${handle}`,
        handle,
        createdAt: product.created_at,
        month: product.created_at.slice(0, 7),
        priceMin: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
        variants: product.variants?.length || 0,
        tags: product.tags || [],
        fetchedAt: new Date().toISOString()
      };
    });
}

async function fetchOfficialTalents() {
  const html = await fetchText(OFFICIAL_TALENTS);
  const listMatch = html.match(/<ul class="talent_list clearfix">([\s\S]*?)<\/ul>/);
  const listHtml = listMatch ? listMatch[1] : html;
  const talents = [];

  for (const match of listHtml.matchAll(/<li>\s*<a href="([^"]+)">[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<h3>\s*([\s\S]*?)\s*<\/h3>/g)) {
    const profileUrl = match[1];
    const imageUrl = match[2];
    const nameHtml = match[3];
    const englishMatch = nameHtml.match(/<span>([\s\S]*?)<\/span>/);
    const japaneseName = decodeHtml(stripTags(nameHtml.replace(/<span>[\s\S]*?<\/span>/g, "")));
    const englishName = englishMatch ? decodeHtml(stripTags(englishMatch[1])) : "";
    const canonicalNames = [...new Set([japaneseName, englishName].map((name) => canonicalTalentName(name)).filter(Boolean))];

    talents.push({
      id: makeId("official-talent", profileUrl),
      source: "official_talents",
      name: japaneseName || englishName,
      englishName,
      canonicalNames,
      imageUrl,
      officialUrl: profileUrl,
      fetchedAt: new Date().toISOString()
    });
  }

  return talents;
}

async function fetchStreams() {
  const [holodexResult, scheduleResult] = await Promise.all([
    fetchHolodexJson(HOLODEX_LIVE),
    fetchHoloScheduleJson(HOLO_SCHEDULE_LIST)
  ]);

  const holodexStreams = holodexResult.items.map((video) => {
    const startAt = video.start_actual || video.start_scheduled || video.available_at || video.published_at;
    const channelName = video.channel?.english_name || video.channel?.name || "Unknown channel";
    return {
      id: makeId("stream", video.id),
      source: "holodex",
      sourceLabel: "Holodex",
      status: video.status,
      title: video.title,
      channelId: video.channel?.id || null,
      channelName,
      channelPhoto: video.channel?.photo || null,
      talents: extractTalents(`${video.title} ${channelName}`),
      topic: video.topic_id || null,
      liveViewers: video.live_viewers || null,
      startAt,
      startedAt: video.start_actual || null,
      scheduledAt: video.start_scheduled || null,
      publishedAt: video.published_at || null,
      availableAt: video.available_at || null,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
      holodexUrl: `https://holodex.net/watch/${video.id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      fetchedAt: new Date().toISOString()
    };
  });

  const scheduleStreams = (scheduleResult.items?.dateGroupList || []).flatMap((group) =>
    (group.videoList || []).map((video) => {
      const videoId = youtubeIdFromUrl(video.url);
      const channelName = video.talent?.name || video.name || "Unknown channel";
      const collaboTalents = (video.collaboTalents || []).map((talent) => talent.name).filter(Boolean);
      const startAt = scheduleDateToIso(video.datetime);
      const status = streamStatusFromSchedule(video);
      return {
        id: makeId("stream", videoId || video.url),
        source: "holo_schedule",
        sourceLabel: "ホロジュール",
        status,
        title: video.title,
        channelId: null,
        channelName,
        channelPhoto: video.talent?.iconImageUrl || null,
        talents: [...new Set([channelName, ...collaboTalents, ...extractTalents(`${video.title} ${channelName}`)])],
        topic: null,
        liveViewers: null,
        startAt,
        startedAt: status === "live" ? startAt : null,
        scheduledAt: startAt,
        publishedAt: null,
        availableAt: null,
        youtubeUrl: video.url,
        holodexUrl: videoId ? `https://holodex.net/watch/${videoId}` : null,
        thumbnailUrl: video.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null),
        fetchedAt: new Date().toISOString()
      };
    })
  );

  const streamMap = new Map();
  for (const stream of [...scheduleStreams, ...holodexStreams]) {
    const key = stream.youtubeUrl || stream.id;
    const existing = streamMap.get(key);
    streamMap.set(key, existing ? { ...existing, ...stream, sourceLabel: `${stream.sourceLabel} + ${existing.sourceLabel}` } : stream);
  }

  const streams = [...streamMap.values()];

  return {
    streams: streams.sort((a, b) => {
      const statusRank = { live: 0, upcoming: 1, past: 2 };
      const rankA = statusRank[a.status] ?? 3;
      const rankB = statusRank[b.status] ?? 3;
      if (rankA !== rankB) return rankA - rankB;
      if (a.status === "past" && b.status === "past") return (b.startAt || "").localeCompare(a.startAt || "");
      return (a.startAt || "").localeCompare(b.startAt || "");
    }),
    status: streams.length ? "ok" : holodexResult.status,
    message: streams.length ? null : holodexResult.message || scheduleResult.message,
    sources: {
      holodex: {
        status: holodexResult.status,
        message: holodexResult.message,
        requiresSecret: "HOLODEX_API_KEY"
      },
      holoSchedule: {
        status: scheduleResult.status,
        message: scheduleResult.message
      }
    }
  };
}

function buildPortalItems(news, products, streams) {
  const streamItems = streams.map((stream) => ({
    id: stream.id,
    source: stream.source,
    category: "stream",
    subcategory: stream.status,
    title: stream.title,
    talents: stream.talents,
    startAt: stream.startAt,
    endAt: null,
    officialUrl: stream.youtubeUrl,
    normalUrl: stream.youtubeUrl,
    affiliateUrl: null,
    isAffiliate: false,
    imageUrl: stream.thumbnailUrl,
    summary: `${stream.channelName}${stream.status === "live" ? " / LIVE" : ""}`,
    status: "published"
  }));

  const productItems = products.map((product) => ({
    id: product.id,
    source: product.source,
    category: product.category === "live_goods" ? "goods" : "goods",
    subcategory: product.category,
    title: product.title,
    talents: product.talents,
    startAt: product.createdAt,
    endAt: null,
    officialUrl: product.officialUrl,
    normalUrl: product.officialUrl,
    affiliateUrl: null,
    isAffiliate: false,
    imageUrl: product.imageUrl,
    summary: priceLabel(product),
    status: "published"
  }));

  const newsItems = news.map((item) => ({
    id: item.id,
    source: item.source,
    category: item.categories[0],
    subcategory: item.categories.join(","),
    title: item.title,
    talents: item.talents,
    startAt: item.publishedAt,
    endAt: null,
    officialUrl: item.officialUrl,
    normalUrl: item.officialUrl,
    affiliateUrl: null,
    isAffiliate: false,
    imageUrl: item.imageUrl,
    summary: item.summary,
    status: "published"
  }));

  return [...streamItems, ...newsItems, ...productItems].sort((a, b) => b.startAt.localeCompare(a.startAt));
}

function priceLabel(product) {
  if (product.priceMin == null) return "価格情報なし";
  if (product.priceMin === product.priceMax) return `${product.priceMin.toLocaleString("ja-JP")}円`;
  return `${product.priceMin.toLocaleString("ja-JP")}円 - ${product.priceMax.toLocaleString("ja-JP")}円`;
}

async function readGeneratedJson(filename, fallback) {
  try {
    const body = await readFile(path.join(outDir, filename), "utf8");
    return JSON.parse(body);
  } catch {
    return fallback;
  }
}

async function fetchWithFallback(label, filename, fetcher) {
  const previous = await readGeneratedJson(filename, []);
  try {
    const items = await fetcher();
    if (!items.length && previous.length) {
      return {
        items: previous,
        status: "stale",
        message: `${label} returned no items. Reused previous generated data.`
      };
    }
    return {
      items,
      status: "ok",
      message: null
    };
  } catch (error) {
    if (previous.length) {
      return {
        items: previous,
        status: "stale",
        message: `${label} fetch failed. Reused previous generated data: ${error.message}`
      };
    }
    throw error;
  }
}

async function fetchStreamsWithFallback() {
  const previous = await readGeneratedJson("streams.json", []);
  const result = await fetchStreams();
  if (!result.streams.length && previous.length) {
    return {
      ...result,
      streams: previous,
      status: "stale",
      message: `${result.message || "Stream fetch returned no items."} Reused previous generated data.`
    };
  }
  return result;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const [newsResult, productResult, streamResult, officialTalentResult] = await Promise.all([
    fetchWithFallback("Official news", "news.json", fetchNews),
    fetchWithFallback("Official shop", "products.json", fetchProducts),
    fetchStreamsWithFallback(),
    fetchWithFallback("Official talents", "official-talents.json", fetchOfficialTalents)
  ]);
  const news = newsResult.items;
  const products = productResult.items;
  const portalItems = buildPortalItems(news, products, streamResult.streams);
  const meta = {
    generatedAt: new Date().toISOString(),
    sources: [NEWS_SITEMAP, "https://shop.hololivepro.com/products.json", "https://holodex.net/api/v2/live", HOLO_SCHEDULE_LIST],
    fetch: {
      timeoutMs: FETCH_TIMEOUT_MS,
      newsLimit: NEWS_LIMIT,
      productLimit: PRODUCT_LIMIT
    },
    datasets: {
      news: {
        status: newsResult.status,
        message: newsResult.message,
        count: news.length,
        source: NEWS_SITEMAP
      },
      products: {
        status: productResult.status,
        message: productResult.message,
        count: products.length,
        source: "https://shop.hololivepro.com/products.json"
      },
      streams: {
        status: streamResult.status,
        message: streamResult.message,
        count: streamResult.streams.length,
        source: "Holodex + Holo Schedule"
      },
      officialTalents: {
        status: officialTalentResult.status,
        message: officialTalentResult.message,
        count: officialTalentResult.items.length,
        source: OFFICIAL_TALENTS
      }
    },
    streams: {
      status: streamResult.status,
      message: streamResult.message,
      sources: streamResult.sources
    },
    holodex: {
      status: streamResult.sources.holodex.status,
      message: streamResult.sources.holodex.message,
      requiresSecret: "HOLODEX_API_KEY"
    },
    counts: {
      news: news.length,
      products: products.length,
      streams: streamResult.streams.length,
      portalItems: portalItems.length
    }
  };

  await writeFile(path.join(outDir, "news.json"), JSON.stringify(news, null, 2));
  await writeFile(path.join(outDir, "products.json"), JSON.stringify(products, null, 2));
  await writeFile(path.join(outDir, "streams.json"), JSON.stringify(streamResult.streams, null, 2));
  await writeFile(path.join(outDir, "official-talents.json"), JSON.stringify(officialTalentResult.items, null, 2));
  await writeFile(path.join(outDir, "portal-items.json"), JSON.stringify(portalItems, null, 2));
  await writeFile(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(`Generated ${news.length} news items, ${products.length} products, ${streamResult.streams.length} streams, and ${officialTalentResult.items.length} official talent profiles.`);
  for (const result of [newsResult, productResult, streamResult, officialTalentResult]) {
    if (result.status === "stale" && result.message) console.warn(result.message);
  }
  if (streamResult.message) console.warn(streamResult.message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
