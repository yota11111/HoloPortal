import { talentBranches, talentBranchLabel, talentBranchValue } from "./talent-groups.mjs";

export const talentCategories = talentBranches;

export function talentCategoryValue(profile) {
  return talentBranchValue(profile);
}

export function talentCategoryLabel(value) {
  return talentBranchLabel(value);
}
