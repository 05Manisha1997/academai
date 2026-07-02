import type { AudienceProfile } from "./profiles";

export type EngagementEventType =
  | "module_started"
  | "step_viewed"
  | "interaction_completed"
  | "hint_requested"
  | "answer_submitted"
  | "module_completed"
  | "module_abandoned";

export interface EngagementEvent {
  eventType: EngagementEventType;
  timestamp: string;
  stepId?: string;
  payload?: Record<string, unknown>;
  durationMs?: number;
}

export interface LearningStep {
  id: string;
  order: number;
  title: string;
  modality: "see" | "touch" | "tweak";
  content: {
    headline: string;
    body: string;
    mediaUrl?: string;
    interactionType?: "quiz" | "drag-drop" | "slider" | "voice-prompt";
    interactionConfig?: Record<string, unknown>;
  };
  successCriteria?: {
    minScore?: number;
    requiredInteractions?: string[];
  };
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  audienceProfiles: AudienceProfile[];
  estimatedMinutes: number;
  sdgTags: string[];
  steps: LearningStep[];
  adaptiveSignals: {
    difficultyLevel: 1 | 2 | 3 | 4 | 5;
    confidenceTopics: string[];
    fearTopics: string[];
  };
  ingestionMeta?: {
    sourceFeed?: string;
    sourceUrl?: string;
    draftStatus: "auto_draft" | "editor_review" | "published";
    generatedAt?: string;
  };
}

export interface ModuleSession {
  sessionId: string;
  userId: string;
  moduleId: string;
  profile: AudienceProfile;
  startedAt: string;
  completedAt?: string;
  engagementEvents: EngagementEvent[];
  stepScores: Record<string, number>;
  aggregateMetrics: {
    totalDurationMs: number;
    hintsUsed: number;
    completionRate: number;
    struggleIndicators: string[];
  };
}
