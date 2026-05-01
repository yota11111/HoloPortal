import { canonicalTalentName } from "./talent-aliases.mjs";

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
  "森カリオペ",
  "Mori Calliope",
  "Calli",
  "小鳥遊キアラ",
  "Takanashi Kiara",
  "Kiara",
  "一伊那尓栖",
  "Ninomae Ina'nis",
  "Ina'nis",
  "Ina",
  "IRyS",
  "オーロ・クロニー",
  "Ouro Kronii",
  "Kronii",
  "ハコス・ベールズ",
  "Hakos Baelz",
  "Baelz",
  "シオリ・ノヴェラ",
  "Shiori Novella",
  "Shiori",
  "古石ビジュー",
  "Koseki Bijou",
  "Bijou",
  "ネリッサ・レイヴンクロフト",
  "Nerissa Ravencroft",
  "Nerissa",
  "フワワ・アビスガード",
  "モココ・アビスガード",
  "FUWAMOCO",
  "Fuwawa Abyssgard",
  "Mococo Abyssgard",
  "ジジ・ムリン",
  "Gigi",
  "Gigi Murin",
  "エリザベス・ローズ・ブラッドフレイム",
  "Elizabeth Rose Bloodflame",
  "Elizabeth",
  "セシリア・イマーグリーン",
  "Cecilia Immergreen",
  "Cecilia",
  "ラオーラ・パンテーラ",
  "Raora Panthera",
  "Raora"
]);

const hololiveIdNames = new Set([
  "ホロライブインドネシア",
  "Ayunda Risu",
  "Risu",
  "アユンダ・リス",
  "Moona Hoshinova",
  "Moona",
  "ムーナ・ホシノヴァ",
  "Airani Iofifteen",
  "Iofi",
  "アイラニ・イオフィフティーン",
  "Kureiji Ollie",
  "Ollie",
  "クレイジー・オリー",
  "Anya Melfissa",
  "Anya",
  "アーニャ・メルフィッサ",
  "Pavolia Reine",
  "Reine",
  "パヴォリア・レイネ",
  "Vestia Zeta",
  "Zeta",
  "ベスティア・ゼータ",
  "Kaela Kovalskia",
  "Kaela",
  "カエラ・コヴァルスキア",
  "Kobo Kanaeru",
  "Kobo",
  "こぼ・かなえる"
]);

const devIsNames = new Set([
  "ReGLOSS",
  "FLOW GLOW",
  "Hiodoshi Ao",
  "火威青",
  "Otonose Kanade",
  "音乃瀬奏",
  "Ichijou Ririka",
  "一条莉々華",
  "Ririka",
  "Juufuutei Raden",
  "儒烏風亭らでん",
  "Raden",
  "Todoroki Hajime",
  "轟はじめ",
  "Isaki Riona",
  "響咲リオナ",
  "Koganei Niko",
  "虎金妃笑虎",
  "Mizumiya Su",
  "水宮枢",
  "Rindo Chihaya",
  "輪堂千速",
  "Kikirara Vivi",
  "綺々羅々ヴィヴィ",
  "井月みちる",
  "Izuki Michiru",
  "花園さやか",
  "Hanazono Sayaka",
  "風白ゆき",
  "Kazeshiro Yuki"
]);

const holostarsJpNames = new Set([
  "花咲みやび",
  "Hanasaki Miyabi",
  "奏手イヅル",
  "アルランディス",
  "Arurandeisu",
  "律可",
  "アステル・レダ",
  "岸堂天真",
  "Kishido Temma",
  "夕刻ロベル",
  "Yukoku Roberu",
  "Roberu",
  "影山シエン",
  "荒咬オウガ",
  "Aragami Oga",
  "夜十神封魔",
  "Yatogami Fuma",
  "羽継烏有",
  "Utsugi Uyu",
  "水無世燐央",
  "Minase Rio"
]);

const holostarsEnNames = new Set([
  "Regis Altare",
  "Axel Syrios",
  "Syrios",
  "Magni Dezmond",
  "Noir Vesper",
  "Gavis Bettel",
  "Bettel",
  "Machina X Flayon",
  "Flayon",
  "Banzoin Hakka",
  "Hakka",
  "Josuiji Shinri",
  "Jurard T Rexford",
  "Jurard",
  "ジュラルド・ティー・レクスフォード",
  "T Rexford",
  "Goldbullet",
  "Octavio",
  "Crimzon Ruze",
  "Crimzon"
]);

const otherNames = new Set([
  "ホロカ公式",
  "春先のどか",
  "Harusaki Nodoka",
  "友人A（えーちゃん）",
  "Friend-A"
]);

function normalizeLabel(name) {
  return canonicalTalentName(name)
    .replace(/^【[^】]+】\s*/, "")
    .trim();
}

function normalizedNames(profile) {
  return [profile.name, profile.officialName, ...(profile.aliases || [])]
    .filter(Boolean)
    .flatMap((name) => {
      const cleaned = name.trim();
      const canonical = canonicalTalentName(cleaned);
      const withoutStatus = normalizeLabel(cleaned);
      return [cleaned, canonical, withoutStatus].filter(Boolean);
    });
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
