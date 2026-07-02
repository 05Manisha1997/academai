import puppyIntro from "../../content/scripts/elderly-super-smart-puppy-intro.json";

export interface ScriptBeat {
  beat: number;
  durationSeconds: number;
  narrator: string;
  onScreen: {
    headline: string;
    visual?: string;
    callout?: string;
    safetyTip?: string;
    nextModule?: string;
    celebration?: string;
  };
  interaction: Record<string, unknown>;
}

export interface LessonScript {
  moduleId: string;
  title: string;
  audienceProfile: string;
  estimatedMinutes: number;
  voiceFirst: boolean;
  script: ScriptBeat[];
}

const SCRIPTS: Record<string, LessonScript> = {
  "super-smart-puppy-intro": puppyIntro as LessonScript,
};

export function getScript(slug: string): LessonScript | null {
  return SCRIPTS[slug] ?? null;
}
