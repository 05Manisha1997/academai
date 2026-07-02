import { intent } from "@/lib/cadet/engine";
import type { AgentRoute } from "./types";
import type { AudienceProfile } from "@/types/profiles";

/**
 * Routes requests to specialized agents (LangGraph-style conditional edges).
 * In production, each route maps to a separate graph node or AutoGen agent.
 */
export function selectRoute(prompt: string, profile?: AudienceProfile): AgentRoute {
  const t = prompt.toLowerCase();
  const i = intent(t);

  if (
    /\b(scam|phish|deepfake|fake news|fraud|impersonat)\b/.test(t) ||
    profile === "elderly"
  ) {
    return "safety";
  }

  if (/\b(ingest|rss|draft module|auto.?draft|curriculum)\b/.test(t)) {
    return "ingestion";
  }

  if (
    i === "explain" ||
    i === "plan" ||
    profile === "under-14" ||
    profile === "students-lecturers"
  ) {
    return "tutor";
  }

  return "general";
}

export function systemPromptForRoute(route: AgentRoute, profile?: AudienceProfile): string {
  const audience =
    profile === "elderly"
      ? "Use plain language, large concepts, and scam-awareness framing."
      : profile === "under-14"
        ? "Use short sentences, no jargon, and friendly tone."
        : profile === "students-lecturers"
          ? "Be precise, cite verification steps, and encourage critical thinking."
          : "Be clear and accessible.";

  const routePrompts: Record<AgentRoute, string> = {
    tutor: `You are academAI tutor agent. Teach using Learn, Practice, Prevent. ${audience}`,
    safety: `You are academAI safety agent. Prioritize scam/deepfake/bias awareness. Never enable harm. ${audience}`,
    ingestion: `You are academAI content agent. Draft age-appropriate learning modules; flag items for human editor review. ${audience}`,
    general: `You are academAI assistant. ${audience}`,
  };

  return routePrompts[route];
}
