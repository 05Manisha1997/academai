import type { ResourceSnapshot } from "@/lib/resource-footprint";
import type { RuleHit } from "@/lib/cadet/types";
import type { AudienceProfile } from "@/types/profiles";

export type OrchestratorBackend = "simulated" | "ollama" | "langgraph" | "autogen";

export type AgentRoute = "tutor" | "safety" | "ingestion" | "general";

export interface OrchestrateRequest {
  prompt: string;
  profile?: AudienceProfile;
  sessionId?: string;
  /** Override backend; defaults to ORCHESTRATOR_BACKEND env */
  backend?: OrchestratorBackend;
}

export interface GuardrailResult {
  passed: boolean;
  blocked: boolean;
  warnings: string[];
  ruleHit?: RuleHit | null;
}

export interface OrchestrateResponse {
  status: "ok" | "blocked" | "warn";
  text: string;
  meta: {
    backend: OrchestratorBackend;
    route: AgentRoute;
    model?: string;
    inputGuardrails: GuardrailResult;
    outputGuardrails: GuardrailResult;
    disclosure?: string;
    resources?: ResourceSnapshot;
  };
}

export interface GenerateResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
}

export interface ModelAdapter {
  name: OrchestratorBackend;
  generate(params: {
    prompt: string;
    system: string;
    route: AgentRoute;
    profile?: AudienceProfile;
  }): Promise<GenerateResult>;
}
