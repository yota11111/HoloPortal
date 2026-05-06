import { canonicalTalentName, talentSearchTerms, talentSearchTermsFromText } from "./talent-aliases.mjs";
import { buildTalentProfiles } from "./talent-data.mjs";
import { talentBranches, talentBranchLabel, talentBranchValue, talentGroups, talentGroupLabels, talentGroupValues } from "./talent-groups.mjs";

export { talentBranches, talentGroups };

export function buildTalentFilterState(items, streams, officialTalents) {
  const talents = buildTalentProfiles(items, streams, officialTalents).map((talent) => {
    const branch = talentBranchValue(talent);
    const groups = talentGroupValues(talent);
    return {
      ...talent,
      branch,
      branchLabel: talentBranchLabel(branch),
      groups,
      groupLabels: talentGroupLabels(groups)
    };
  });
  const branchCounts = {};
  const groupCounts = {};
  for (const talent of talents) {
    branchCounts[talent.branch] = (branchCounts[talent.branch] || 0) + 1;
    for (const group of talent.groups) {
      groupCounts[group] = (groupCounts[group] || 0) + 1;
    }
  }
  return { talents, branchCounts, groupCounts };
}

export function uniqueTalentNames(names) {
  return [...new Set((names || []).map((name) => canonicalTalentName(name)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
}

export function talentFilterData(names) {
  const talents = uniqueTalentNames(names);
  const branches = new Set();
  const groups = new Set();
  for (const talent of talents) {
    branches.add(talentBranchValue(talent));
    for (const group of talentGroupValues(talent)) {
      groups.add(group);
    }
  }
  return {
    talents,
    branches: [...branches],
    groups: [...groups]
  };
}

export function streamTalentFilterData(stream) {
  return talentFilterData(talentSearchTerms([stream.channelName, ...(stream.talents || [])]));
}

export function itemTalentFilterData(item) {
  return talentFilterData([...(item.talents || []), ...talentSearchTerms(item.talents || [])]);
}

export function productTalentFilterData(product) {
  return talentFilterData([
    ...(product.talents || []),
    ...talentSearchTerms(product.talents || []),
    ...talentSearchTermsFromText(`${product.title} ${(product.tags || []).join(" ")}`)
  ]);
}

export function dataTokenList(values) {
  return `|${(values || []).filter(Boolean).join("|")}|`;
}

export function talentOptionValue(talent) {
  return talent.name;
}
