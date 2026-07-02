import type { OrchestratorBackend } from "@/lib/orchestrator/types";

/** Rough usage for one inference or learning activity (estimates labeled in UI). */
export interface ResourceSnapshot {
  id: string;
  at: string;
  activity: "prompt" | "learning" | "practice";
  backend: OrchestratorBackend | "none";
  model?: string;
  blocked: boolean;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  /** Estimated watt-hours (device / local inference). */
  energyWh: number;
  /** Estimated grams CO₂ equivalent. */
  co2g: number;
  locality: "local" | "simulated" | "sidecar";
  label: string;
}

export interface ResourceSession {
  prompts: number;
  learningSteps: number;
  totalTokens: number;
  energyWh: number;
  co2g: number;
  last?: ResourceSnapshot;
}

export function emptySession(): ResourceSession {
  return {
    prompts: 0,
    learningSteps: 0,
    totalTokens: 0,
    energyWh: 0,
    co2g: 0,
  };
}

/** ~0.3 kg CO₂ per kWh — rough EU grid average for local device draw. */
const GRID_KG_PER_KWH = 0.3;

/** Wh per 1k tokens — educational estimate for on-device 7B-class models. */
const WH_PER_1K_TOKENS: Record<string, number> = {
  simulated: 0,
  ollama: 0.12,
  langgraph: 0.14,
  autogen: 0.15,
};

export function estimateTokensFromText(text: string): number {
  return Math.max(0, Math.ceil(text.trim().length / 4));
}

export function buildResourceSnapshot(params: {
  activity: ResourceSnapshot["activity"];
  backend: OrchestratorBackend | "none";
  model?: string;
  blocked?: boolean;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
  promptText?: string;
  completionText?: string;
  label?: string;
}): ResourceSnapshot {
  const blocked = params.blocked ?? false;
  const promptTokens =
    params.promptTokens ?? (params.promptText ? estimateTokensFromText(params.promptText) : 0);
  const completionTokens =
    params.completionTokens ??
    (params.completionText ? estimateTokensFromText(params.completionText) : 0);
  const totalTokens = blocked ? promptTokens : promptTokens + completionTokens;
  const latencyMs = params.latencyMs ?? 0;

  const backendKey = params.backend === "none" ? "simulated" : params.backend;
  const whPer1k = WH_PER_1K_TOKENS[backendKey] ?? 0.12;
  const energyWh = blocked ? 0 : (totalTokens / 1000) * whPer1k;
  const co2g = (energyWh / 1000) * GRID_KG_PER_KWH * 1000;

  let locality: ResourceSnapshot["locality"] = "simulated";
  if (params.backend === "ollama") locality = "local";
  if (params.backend === "langgraph" || params.backend === "autogen") locality = "sidecar";
  if (params.backend === "none") locality = "simulated";

  let label = params.label ?? "No AI inference";
  if (!params.label) {
    if (params.activity === "learning") label = "Lesson · no model call";
    else if (blocked) label = "Blocked · no model tokens";
    else if (params.backend === "ollama") label = `Local · ${params.model ?? "Llama 2"}`;
    else if (params.backend === "simulated") label = "Simulated · on-device";
    else if (params.backend === "langgraph") label = "LangGraph · local sidecar";
    else if (params.backend === "autogen") label = "AutoGen · local sidecar";
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    activity: params.activity,
    backend: params.backend,
    model: params.model,
    blocked,
    promptTokens,
    completionTokens,
    totalTokens,
    latencyMs,
    energyWh,
    co2g,
    locality,
    label,
  };
}

export function applySnapshot(session: ResourceSession, snap: ResourceSnapshot): ResourceSession {
  return {
    prompts: session.prompts + (snap.activity === "prompt" ? 1 : 0),
    learningSteps: session.learningSteps + (snap.activity === "learning" ? 1 : 0),
    totalTokens: session.totalTokens + snap.totalTokens,
    energyWh: session.energyWh + snap.energyWh,
    co2g: session.co2g + snap.co2g,
    last: snap,
  };
}

export function formatWh(wh: number): string {
  if (wh === 0) return "0 Wh";
  if (wh < 0.001) return "<0.001 Wh";
  if (wh < 1) return `${wh.toFixed(3)} Wh`;
  return `${wh.toFixed(2)} Wh`;
}

export function formatCo2(g: number): string {
  if (g === 0) return "0 g";
  if (g < 0.01) return "<0.01 g";
  return `${g.toFixed(2)} g CO₂e`;
}

export function formatTokens(n: number): string {
  return n.toLocaleString();
}
