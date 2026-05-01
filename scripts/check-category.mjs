import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildTalentProfiles } from "../src/lib/talent-data.mjs";
import { talentCategories, talentCategoryLabel, talentCategoryValue } from "../src/lib/talent-categories.mjs";

const root = process.cwd();
const generatedDir = path.join(root, "src/data/generated");

async function readJson(fileName) {
  const text = await readFile(path.join(generatedDir, fileName), "utf8");
  return JSON.parse(text);
}

function profileNames(profile) {
  return [profile.name, profile.officialName, ...(profile.aliases || [])].filter(Boolean);
}

function findProfile(profiles, names) {
  return profiles.find((profile) => profileNames(profile).some((name) => names.includes(name)));
}

const [items, streams, officialTalents] = await Promise.all([
  readJson("portal-items.json"),
  readJson("streams.json"),
  readJson("official-talents.json")
]);

const profiles = buildTalentProfiles(items, streams, officialTalents);
const validProfileCategories = new Set(talentCategories.map((category) => category.value).filter((value) => value !== "all"));
const requiredCategories = [...validProfileCategories];
const counts = Object.fromEntries(requiredCategories.map((value) => [value, 0]));
let failed = false;

if (profiles.length === 0) {
  console.error("Talent category check failed: no generated talent profiles.");
  process.exit(1);
}

for (const profile of profiles) {
  const category = talentCategoryValue(profile);
  if (!validProfileCategories.has(category)) {
    console.error(`Invalid category for ${profile.name}: ${category}`);
    failed = true;
    continue;
  }
  counts[category] += 1;
}

for (const category of requiredCategories) {
  if (counts[category] <= 0) {
    console.error(`Category has no displayed talent profiles: ${category}`);
    failed = true;
  }
}

const representativeChecks = [
  { label: "宝鐘マリン", names: ["宝鐘マリン", "Houshou Marine"], expected: "hololive-jp" },
  { label: "小鳥遊キアラ", names: ["小鳥遊キアラ", "Takanashi Kiara", "Kiara"], expected: "hololive-en" },
  { label: "Pavolia Reine", names: ["Pavolia Reine", "パヴォリア・レイネ", "Reine"], expected: "hololive-id" },
  { label: "一条莉々華", names: ["一条莉々華", "Ichijou Ririka", "Ririka"], expected: "dev-is" },
  { label: "夕刻ロベル", names: ["夕刻ロベル", "Yukoku Roberu", "Roberu"], expected: "holostars-jp" },
  { label: "Jurard T Rexford", names: ["Jurard T Rexford", "ジュラルド・ティー・レクスフォード", "Jurard"], expected: "holostars-en" },
  { label: "ホロカ公式", names: ["ホロカ公式"], expected: "other" }
];

for (const check of representativeChecks) {
  const profile = findProfile(profiles, check.names);
  const category = profile ? talentCategoryValue(profile) : talentCategoryValue({ name: check.names[0], aliases: check.names.slice(1) });

  if (!profile) {
    console.warn(`Representative profile not present in generated data, checked mapping directly: ${check.label}`);
  }

  if (category !== check.expected) {
    console.error(`${check.label} mapped to ${category}, expected ${check.expected}.`);
    failed = true;
  } else {
    console.log(`${check.label}: ${talentCategoryLabel(category)} (${category})`);
  }
}

for (const category of requiredCategories) {
  console.log(`${talentCategoryLabel(category)}: ${counts[category]} profiles`);
}

if (failed) {
  console.error("Talent category check failed.");
  process.exit(1);
}

console.log("Talent category check passed.");
