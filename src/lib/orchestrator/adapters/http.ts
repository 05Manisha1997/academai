import type { ModelAdapter, OrchestratorBackend } from "../types";

/**
 * HTTP adapter for external orchestration services (LangGraph or AutoGen sidecars).
 *
 * LangGraph service: POST LANGGRAPH_ORCHESTRATOR_URL
 * AutoGen service:   POST AUTOGEN_ORCHESTRATOR_URL
 *
 * Expected JSON body: { prompt, system, route, profile }
 * Expected response:    { text: string }
 */
function createHttpAdapter(
  name: OrchestratorBackend,
  envKey: string
): ModelAdapter {
  return {
    name,
    async generate({ prompt, system, route, profile }) {
      const url = process.env[envKey];
      if (!url) {
        throw new Error(`${envKey} is not configured`);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ORCHESTRATOR_API_KEY
            ? { Authorization: `Bearer ${process.env.ORCHESTRATOR_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({ prompt, system, route, profile }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${name} orchestrator error (${res.status}): ${err.slice(0, 200)}`);
      }

      const data = (await res.json()) as { text?: string; output?: string };
      return data.text ?? data.output ?? "";
    },
  };
}

export const langgraphAdapter = createHttpAdapter("langgraph", "LANGGRAPH_ORCHESTRATOR_URL");
export const autogenAdapter = createHttpAdapter("autogen", "AUTOGEN_ORCHESTRATOR_URL");
