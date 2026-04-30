export const talentCategories = [
  { value: "all", label: "すべて" },
  { value: "hololive-jp", label: "ホロライブJP" },
  { value: "hololive-en", label: "ホロライブEnglish" },
  { value: "hololive-id", label: "ホロライブID" },
  { value: "dev-is", label: "hololive DEV_IS" },
  { value: "holostars-jp", label: "ホロスターズJP" },
  { value: "holostars-en", label: "HOLOSTARS English" },
  { value: "other", label: "公式/その他" }
];

const categoryLabels = Object.fromEntries(talentCategories.map((category) => [category.value, category.label]));

const hololiveEnNames = new Set([
  "ホロライブEnglish",
  "Mori Calliope",
  "小鳥遊キアラ",
  "一伊那尓栖",
  "IRyS",
  "Ouro Kronii",
  "ハコス・ベールズ",
  "Shiori Novella",
  "Koseki Bijou",
  "Nerissa Ravencroft",
  "FUWAMOCO",
  "Gigi",
  "エリザベス・ローズ・ブラッドフレイム",
  "セシリア・イマーグリーン",
  "ラオーラ・パンテーラ"
]);

const hololiveIdNames = new Set([
  "ホロライブインドネシア",
  "Ayunda Risu",
  "アユンダ・リス",
  "Moona Hoshinova",
  "ムーナ・ホシノヴァ",
  "Airani Iofifteen",
  "アイラニ・イオフィフティーン",
  "Kureiji Ollie",
  "クレイジー・オリー",
  "Anya Melfissa",
  "アーニャ・メルフィッサ",
  "Pavolia Reine",
  "パヴォリア・レイネ",
  "Vestia Zeta",
  "ベスティア・ゼータ",
  "Kaela Kovalskia",
  "カエラ・コヴァルスキア",
  "Kobo Kanaeru",
  "こぼ・かなえる"
]);

const devIsNames = new Set([
  "ReGLOSS",
  "FLOW GLOW",
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
  "井月みちる",
  "花園さやか",
  "風白ゆき"
]);

const holostarsJpNames = new Set([
  "花咲みやび",
  "奏手イヅル",
  "アルランディス",
  "律可",
  "アステル・レダ",
  "岸堂天真",
  "夕刻ロベル",
  "影山シエン",
  "荒咬オウガ",
  "夜十神封魔",
  "羽継烏有",
  "水無世燐央"
]);

const holostarsEnNames = new Set([
  "Regis Altare",
  "Axel Syrios",
  "Syrios",
  "Magni Dezmond",
  "Noir Vesper",
  "Gavis Bettel",
  "Machina X Flayon",
  "Flayon",
  "Banzoin Hakka",
  "Josuiji Shinri",
  "Jurard T Rexford",
  "Goldbullet",
  "Octavio",
  "Crimzon Ruze"
]);

const otherNames = new Set(["ホロカ公式", "春先のどか", "友人A（えーちゃん）"]);

function normalizedNames(profile) {
  return [profile.name, profile.officialName, ...(profile.aliases || [])].filter(Boolean);
}

function includesAny(names, targetNames) {
  return names.some((name) => targetNames.has(name));
}

export function talentCategoryValue(profile) {
  const names = normalizedNames(profile);
  if (includesAny(names, otherNames)) return "other";
  if (includesAny(names, devIsNames)) return "dev-is";
  if (includesAny(names, holostarsEnNames)) return "holostars-en";
  if (includesAny(names, holostarsJpNames)) return "holostars-jp";
  if (includesAny(names, hololiveIdNames)) return "hololive-id";
  if (includesAny(names, hololiveEnNames)) return "hololive-en";
  return "hololive-jp";
}

export function talentCategoryLabel(value) {
  return categoryLabels[value] || categoryLabels.other;
}
