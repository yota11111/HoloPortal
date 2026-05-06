import { canonicalTalentName } from "./talent-aliases.mjs";

export const talentBranches = [
  { value: "all", label: "すべて" },
  { value: "hololive-jp", label: "ホロライブJP" },
  { value: "hololive-id", label: "ホロライブID" },
  { value: "hololive-en", label: "ホロライブEnglish" },
  { value: "dev-is", label: "hololive DEV_IS" },
  { value: "holostars-jp", label: "ホロスターズJP" },
  { value: "holostars-en", label: "HOLOSTARS English" },
  { value: "other", label: "公式/その他" }
];

export const talentGroups = [
  { value: "all", branch: "all", label: "すべて", order: 0 },
  { value: "hololive-gen0", branch: "hololive-jp", label: "0期生", order: 100 },
  { value: "hololive-gen1", branch: "hololive-jp", label: "1期生", order: 110 },
  { value: "hololive-gen2", branch: "hololive-jp", label: "2期生", order: 120 },
  { value: "hololive-gamers", branch: "hololive-jp", label: "ホロライブゲーマーズ", order: 130 },
  { value: "hololive-gen3", branch: "hololive-jp", label: "3期生", order: 140 },
  { value: "hololive-gen4", branch: "hololive-jp", label: "4期生", order: 150 },
  { value: "hololive-gen5", branch: "hololive-jp", label: "5期生", order: 160 },
  { value: "holox", branch: "hololive-jp", label: "秘密結社holoX", order: 170 },
  { value: "id-gen1", branch: "hololive-id", label: "ID 1期生", order: 200 },
  { value: "id-gen2", branch: "hololive-id", label: "ID 2期生", order: 210 },
  { value: "id-gen3", branch: "hololive-id", label: "ID 3期生", order: 220 },
  { value: "myth", branch: "hololive-en", label: "Myth", order: 300 },
  { value: "project-hope", branch: "hololive-en", label: "Project: HOPE", order: 310 },
  { value: "council", branch: "hololive-en", label: "Council", order: 320 },
  { value: "promise", branch: "hololive-en", label: "Promise", order: 330 },
  { value: "advent", branch: "hololive-en", label: "Advent", order: 340 },
  { value: "justice", branch: "hololive-en", label: "Justice", order: 350 },
  { value: "regloss", branch: "dev-is", label: "ReGLOSS", order: 400 },
  { value: "flow-glow", branch: "dev-is", label: "FLOW GLOW", order: 410 },
  { value: "stars-gen1", branch: "holostars-jp", label: "ホロスターズ1期生", order: 500 },
  { value: "stars-gen2", branch: "holostars-jp", label: "ホロスターズ2期生", order: 510 },
  { value: "stars-gen3", branch: "holostars-jp", label: "ホロスターズ3期生", order: 520 },
  { value: "uproar", branch: "holostars-jp", label: "UPROAR!!", order: 530 },
  { value: "tempus", branch: "holostars-en", label: "TEMPUS", order: 600 },
  { value: "armis", branch: "holostars-en", label: "ARMIS", order: 610 },
  { value: "other", branch: "other", label: "公式/その他", order: 900 }
];

const groupAliases = [
  ["hololive-gen0", ["ときのそら", "Tokino Sora", "ロボ子さん", "Robocosan", "AZKi", "さくらみこ", "Sakura Miko", "星街すいせい", "Hoshimachi Suisei"]],
  ["hololive-gen1", ["アキ・ローゼンタール", "Aki Rosenthal", "赤井はあと", "Akai Haato", "白上フブキ", "Shirakami Fubuki", "夏色まつり", "Natsuiro Matsuri"]],
  ["hololive-gen2", ["百鬼あやめ", "Nakiri Ayame", "癒月ちょこ", "Yuzuki Choco", "大空スバル", "Oozora Subaru"]],
  ["hololive-gamers", ["白上フブキ", "Shirakami Fubuki", "大神ミオ", "Ookami Mio", "猫又おかゆ", "Nekomata Okayu", "戌神ころね", "Inugami Korone"]],
  ["hololive-gen3", ["兎田ぺこら", "Usada Pekora", "不知火フレア", "Shiranui Flare", "白銀ノエル", "Shirogane Noel", "宝鐘マリン", "Houshou Marine"]],
  ["hololive-gen4", ["天音かなた", "Amane Kanata", "角巻わため", "Tsunomaki Watame", "常闇トワ", "Tokoyami Towa", "姫森ルーナ", "Himemori Luna"]],
  ["hololive-gen5", ["雪花ラミィ", "Yukihana Lamy", "桃鈴ねね", "Momosuzu Nene", "獅白ぼたん", "Shishiro Botan", "尾丸ポルカ", "Omaru Polka"]],
  ["holox", ["ラプラス・ダークネス", "La+ Darknesss", "Laplus Darknesss", "鷹嶺ルイ", "Takane Lui", "博衣こより", "Hakui Koyori", "沙花叉クロヱ", "Sakamata Chloe", "風真いろは", "Kazama Iroha"]],
  ["id-gen1", ["アユンダ・リス", "Ayunda Risu", "ムーナ・ホシノヴァ", "Moona Hoshinova", "アイラニ・イオフィフティーン", "Airani Iofifteen"]],
  ["id-gen2", ["クレイジー・オリー", "Kureiji Ollie", "アーニャ・メルフィッサ", "Anya Melfissa", "パヴォリア・レイネ", "Pavolia Reine"]],
  ["id-gen3", ["ベスティア・ゼータ", "Vestia Zeta", "カエラ・コヴァルスキア", "Kaela Kovalskia", "こぼ・かなえる", "Kobo Kanaeru"]],
  ["myth", ["Mori Calliope", "Takanashi Kiara", "Ninomae Ina'nis"]],
  ["project-hope", ["IRyS"]],
  ["council", ["Ouro Kronii", "Hakos Baelz"]],
  ["promise", ["IRyS", "Ouro Kronii", "Hakos Baelz"]],
  ["advent", ["Shiori Novella", "Koseki Bijou", "Nerissa Ravencroft", "FUWAMOCO", "Fuwawa Abyssgard", "Mococo Abyssgard"]],
  ["justice", ["Elizabeth Rose Bloodflame", "Cecilia Immergreen", "Raora Panthera", "Gigi Murin", "Gigi"]],
  ["regloss", ["Hiodoshi Ao", "火威青", "Otonose Kanade", "音乃瀬奏", "Ichijou Ririka", "一条莉々華", "Juufuutei Raden", "儒烏風亭らでん", "Todoroki Hajime", "轟はじめ"]],
  ["flow-glow", ["Isaki Riona", "響咲リオナ", "Koganei Niko", "虎金妃笑虎", "Mizumiya Su", "水宮枢", "Rindo Chihaya", "輪堂千速", "Kikirara Vivi", "綺々羅々ヴィヴィ"]],
  ["stars-gen1", ["Hanasaki Miyabi", "花咲みやび", "Kanade Izuru", "奏手イヅル", "Arurandeisu", "アルランディス", "Rikka", "律可"]],
  ["stars-gen2", ["Astel Leda", "アステル・レダ", "Kishido Temma", "岸堂天真", "Yukoku Roberu", "夕刻ロベル"]],
  ["stars-gen3", ["Kageyama Shien", "影山シエン", "Aragami Oga", "荒咬オウガ"]],
  ["uproar", ["Yatogami Fuma", "夜十神封魔", "Utsugi Uyu", "羽継烏有", "Minase Rio", "水無世燐央"]],
  ["tempus", ["Regis Altare", "Axel Syrios", "Gavis Bettel", "Machina X Flayon", "Banzoin Hakka", "Josuiji Shinri"]],
  ["armis", ["Jurard T Rexford", "Goldbullet", "Octavio", "Crimzon Ruze"]],
  ["other", ["春先のどか", "Harusaki Nodoka", "友人A", "Friend-A", "ホロカ公式"]]
];

const groupByName = new Map();
const groupOrderByName = new Map();
const groupMeta = Object.fromEntries(talentGroups.map((group) => [group.value, group]));

for (const [group, names] of groupAliases) {
  names.forEach((name, index) => {
    const keys = new Set([name, canonicalTalentName(name)].filter(Boolean));
    for (const key of keys) {
      if (!groupByName.has(key)) groupByName.set(key, group);
      if (!groupOrderByName.has(key)) groupOrderByName.set(key, index);
    }
  });
}

function profileNames(profile) {
  return [profile.name, profile.officialName, ...(profile.aliases || [])].filter(Boolean);
}

export function talentGroupValue(profileOrName) {
  const names = typeof profileOrName === "string" ? [profileOrName] : profileNames(profileOrName);
  for (const name of names) {
    const direct = groupByName.get(name);
    if (direct) return direct;
    const canonical = groupByName.get(canonicalTalentName(name));
    if (canonical) return canonical;
  }
  return "other";
}

export function talentBranchValue(profileOrName) {
  return groupMeta[talentGroupValue(profileOrName)]?.branch || "other";
}

export function talentGroupLabel(value) {
  return groupMeta[value]?.label || groupMeta.other.label;
}

export function talentBranchLabel(value) {
  return talentBranches.find((branch) => branch.value === value)?.label || talentBranches.at(-1).label;
}

export function talentSortValue(profile) {
  const group = talentGroupValue(profile);
  const groupOrder = groupMeta[group]?.order ?? 999;
  const names = profileNames(profile);
  const memberOrder = names.reduce((best, name) => {
    const direct = groupOrderByName.get(name);
    const canonical = groupOrderByName.get(canonicalTalentName(name));
    return Math.min(best, direct ?? Infinity, canonical ?? Infinity);
  }, Infinity);
  return groupOrder * 100 + (Number.isFinite(memberOrder) ? memberOrder : 99);
}
