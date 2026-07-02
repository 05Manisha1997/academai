/** Audience profiles aligned with SDG 4, 10, 11, 17 */
export type AudienceProfile = "under-14" | "students-lecturers" | "elderly";

export const PROFILE_LABELS: Record<AudienceProfile, string> = {
  "under-14": "Young Explorers (Under 14)",
  "students-lecturers": "Students & Lecturers",
  elderly: "Silver Learners",
};

export const PROFILE_SDG_THEMES: Record<AudienceProfile, string[]> = {
  "under-14": ["SDG 4: Quality Education", "SDG 10: Reduced Inequalities"],
  "students-lecturers": ["SDG 4", "SDG 17: Partnerships"],
  elderly: ["SDG 11: Sustainable Communities", "SDG 10"],
};
