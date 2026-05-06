import { canonicalTalentName, talentSearchTerms, talentSearchTermsFromText } from "./talent-aliases.mjs";
import { talentSortValue } from "./talent-groups.mjs";

export const itemLabels = {
  stream: "配信",
  live: "ライブ",
  goods: "グッズ",
  event: "イベント",
  music: "音楽",
  news: "ニュース"
};

export function talentSlug(name) {
  return name.replaceAll("/", "-");
}

function byLatest(a, b) {
  return (b.startAt || "").localeCompare(a.startAt || "");
}

function ensureProfile(map, name, aliasMap = new Map()) {
  const cleaned = aliasMap.get(name) || aliasMap.get(canonicalTalentName(name)) || canonicalTalentName(name);
  if (!cleaned) return null;
  if (!map.has(cleaned)) {
    map.set(cleaned, {
      name: cleaned,
      slug: talentSlug(cleaned),
      aliases: [],
      streams: [],
      items: [],
      latestAt: "",
      latestImage: null,
      counts: {
        total: 0,
        streams: 0,
        goods: 0,
        news: 0,
        events: 0
      }
    });
  }
  const profile = map.get(cleaned);
  const rawName = name?.trim();
  if (rawName && rawName !== cleaned && !profile.aliases.includes(rawName)) {
    profile.aliases.push(rawName);
  }
  return profile;
}

function touchLatest(profile, date, imageUrl) {
  if (date && date > profile.latestAt) profile.latestAt = date;
  if (!profile.latestImage && imageUrl) profile.latestImage = imageUrl;
}

function officialTalentMap(officialTalents = []) {
  const map = new Map();
  for (const talent of officialTalents) {
    for (const name of [talent.name, talent.englishName, ...(talent.canonicalNames || [])].filter(Boolean)) {
      if (!map.has(name)) map.set(name, talent);
    }
  }
  return map;
}

function officialAliasMap(officialTalents = []) {
  const map = new Map();
  for (const talent of officialTalents) {
    const primary = canonicalTalentName(talent.canonicalNames?.[0] || talent.name || talent.englishName);
    if (!primary) continue;
    for (const name of [talent.name, talent.englishName, ...(talent.canonicalNames || [])].filter(Boolean)) {
      for (const key of [name, canonicalTalentName(name)].filter(Boolean)) {
        if (!map.has(key)) map.set(key, primary);
      }
    }
  }
  return map;
}

function uniqueCanonicalTalentNames(names = []) {
  const talents = [];
  for (const name of names) {
    const canonical = canonicalTalentName(name);
    if (canonical && !talents.includes(canonical)) talents.push(canonical);
  }
  return talents;
}

function streamTalentNames(stream) {
  return uniqueCanonicalTalentNames(talentSearchTerms([stream.channelName, ...(stream.talents || [])]));
}

function itemTalentNames(item) {
  return uniqueCanonicalTalentNames([
    ...(item.talents || []),
    ...talentSearchTerms(item.talents || []),
    ...talentSearchTermsFromText(`${item.title || ""} ${item.summary || ""} ${item.subcategory || ""}`)
  ]);
}

export function buildTalentProfiles(items, streams, officialTalents = []) {
  const profiles = new Map();
  const officialMap = officialTalentMap(officialTalents);
  const aliasMap = officialAliasMap(officialTalents);

  for (const talent of officialTalents) {
    const primaryName = talent.canonicalNames?.[0] || talent.name || talent.englishName;
    const profile = ensureProfile(profiles, primaryName, aliasMap);
    if (!profile) continue;
    for (const alias of [talent.name, talent.englishName, ...(talent.canonicalNames || [])]) {
      const cleaned = alias?.trim();
      if (cleaned && cleaned !== profile.name && !profile.aliases.includes(cleaned)) {
        profile.aliases.push(cleaned);
      }
    }
  }

  for (const stream of streams) {
    const seenNames = new Set();
    for (const name of streamTalentNames(stream)) {
      const canonical = canonicalTalentName(name);
      if (!canonical || seenNames.has(canonical)) continue;
      seenNames.add(canonical);
      const profile = ensureProfile(profiles, name, aliasMap);
      if (!profile) continue;
      profile.streams.push(stream);
      profile.counts.streams += 1;
      touchLatest(profile, stream.startAt, stream.channelPhoto || stream.thumbnailUrl);
    }
  }

  for (const item of items) {
    if (item.category === "stream") continue;
    const seenNames = new Set();
    for (const name of itemTalentNames(item)) {
      const canonical = canonicalTalentName(name);
      if (!canonical || seenNames.has(canonical)) continue;
      seenNames.add(canonical);
      const profile = ensureProfile(profiles, name, aliasMap);
      if (!profile) continue;
      profile.items.push(item);
      if (item.category === "goods") profile.counts.goods += 1;
      else if (["live", "event", "music"].includes(item.category)) profile.counts.events += 1;
      else profile.counts.news += 1;
      touchLatest(profile, item.startAt, item.imageUrl);
    }
  }

  return [...profiles.values()]
    .map((profile) => {
      const official = officialMap.get(profile.name);
      profile.streams.sort(byLatest);
      profile.items.sort(byLatest);
      profile.aliases.sort((a, b) => a.localeCompare(b, "ja"));
      profile.counts.total = profile.streams.length + profile.items.length;
      profile.officialImage = official?.imageUrl || null;
      profile.officialUrl = official?.officialUrl || null;
      profile.officialName = official?.name || null;
      profile.latestImage ||= profile.streams[0]?.thumbnailUrl || profile.items[0]?.imageUrl || null;
      profile.displayImage = profile.officialImage || profile.latestImage;
      return profile;
    })
    .sort((a, b) => talentSortValue(a) - talentSortValue(b) || a.name.localeCompare(b.name, "ja"));
}

export function formatDate(value) {
  if (!value) return "未定";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return "未定";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
