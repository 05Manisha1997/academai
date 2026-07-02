export type RuleSeverity = "block" | "warn";
export type RuleKind = "safety" | "eu";

export interface RuleHit {
  kind: RuleKind;
  severity: RuleSeverity;
  icon: string;
  kicker: string;
  title: string;
  body: string;
  refTag: string;
  refBg: string;
  refText: string;
  fix: string;
}

export interface PromptAnalysis {
  t: string;
  words: number;
  has: {
    context: boolean;
    role: boolean;
    format: boolean;
    audience: boolean;
    specific: boolean;
  };
  score: number;
  intent: string;
  tokens: number;
  flag: RuleHit | null;
}

export interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

export interface PendingRun {
  raw: string;
  a: PromptAnalysis;
}

export type MissionId =
  | "first"
  | "context"
  | "role"
  | "risk"
  | "rules"
  | "tokens";

export type SandboxMode = "simulated" | "live";

export interface SandboxState {
  messages: ChatMessage[];
  input: string;
  running: boolean;
  mode: SandboxMode;
  credits: number;
  active: number;
  done: Partial<Record<MissionId, boolean>>;
  popup: RuleHit | null;
  pending: PendingRun | null;
}
