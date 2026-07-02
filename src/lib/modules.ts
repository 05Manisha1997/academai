import type { LearningModule } from "@/types/learning-module";
import spotTheDeepfake from "../../content/modules/spot-the-deepfake.json";

const MODULES: Record<string, LearningModule> = {
  "spot-the-deepfake": spotTheDeepfake as unknown as LearningModule,
};

export function getModule(slug: string): LearningModule | null {
  return MODULES[slug] ?? null;
}

export function listModulesForProfile(profile: string): LearningModule[] {
  return Object.values(MODULES).filter((m) =>
    m.audienceProfiles.includes(profile as LearningModule["audienceProfiles"][number])
  );
}

export const SCRIPT_SLUGS = ["super-smart-puppy-intro"] as const;

export function isScriptModule(slug: string): boolean {
  return (SCRIPT_SLUGS as readonly string[]).includes(slug);
}
