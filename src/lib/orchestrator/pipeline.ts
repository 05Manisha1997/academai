import { buildResourceSnapshot } from "@/lib/resource-footprint";
import { autogenAdapter, langgraphAdapter } from "./adapters/http";
import { ollamaAdapter } from "./adapters/ollama";
import { simulatedAdapter } from "./adapters/simulated";
import { runInputGuardrails, runOutputGuardrails } from "./guardrails";
import { selectRoute, systemPromptForRoute } from "./router";
import type {
  ModelAdapter,
  OrchestrateRequest,
  OrchestrateResponse,
  OrchestratorBackend,
} from "./types";

function getAdapter(backend: OrchestratorBackend): ModelAdapter {
  switch (backend) {
    case "ollama":
      return ollamaAdapter;
    case "langgraph":
      return langgraphAdapter;
    case "autogen":
      return autogenAdapter;
    case "simulated":
    default:
      return simulatedAdapter;
  }
}

function resolveBackend(requested?: OrchestratorBackend): OrchestratorBackend {
  const env = (process.env.ORCHESTRATOR_BACKEND ?? "simulated") as OrchestratorBackend;
  return requested ?? env;
}

function applyOutputGuardrails(text: string, inputHadEuWarn: boolean): string {
  const check = runOutputGuardrails(text, inputHadEuWarn);
  if (!check.passed) return text;

  let out = text;
  if (out.length > 12000) {
    out = out.slice(0, 12000) + "\n\n[truncated for safety]";
  }
  out = out
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[PHONE REDACTED]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL REDACTED]");
  if (inputHadEuWarn && !/ai-generated|artificially generated/i.test(out)) {
    out = "[AI-generated content]\n\n" + out;
  }
  return out;
}

/**
 * academAI orchestration pipeline (guardrails → router → model → output guardrails).
 * Mirrors LangGraph state-machine stages; swap adapters without changing callers.
 */
export async function orchestrate(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  const backend = resolveBackend(req.backend);
  const inputGuardrails = runInputGuardrails(req.prompt);

  if (inputGuardrails.blocked) {
    const model = backend === "ollama" ? process.env.OLLAMA_MODEL ?? "llama2" : undefined;
    return {
      status: "blocked",
      text:
        inputGuardrails.ruleHit?.body ??
        "This request was blocked by academAI guardrails. Please revise your prompt.",
      meta: {
        backend,
        route: "safety",
        inputGuardrails,
        outputGuardrails: { passed: false, blocked: true, warnings: [] },
        disclosure: "Blocked before model call — no tokens spent.",
        resources: buildResourceSnapshot({
          activity: "prompt",
          backend,
          model,
          blocked: true,
          promptText: req.prompt,
        }),
      },
    };
  }

  const route = selectRoute(req.prompt, req.profile);
  const system = systemPromptForRoute(route, req.profile);
  const adapter = getAdapter(backend);

  let result;
  try {
    result = await adapter.generate({
      prompt: req.prompt,
      system,
      route,
      profile: req.profile,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Model call failed";
    const model = backend === "ollama" ? process.env.OLLAMA_MODEL ?? "llama2" : undefined;
    return {
      status: "blocked",
      text: `Orchestrator could not complete the request.\n\n${message}\n\nTip: set ORCHESTRATOR_BACKEND=simulated, or configure Ollama / LangGraph / AutoGen URLs.`,
      meta: {
        backend,
        route,
        model,
        inputGuardrails,
        outputGuardrails: { passed: false, blocked: true, warnings: [message] },
        resources: buildResourceSnapshot({
          activity: "prompt",
          backend,
          model,
          blocked: true,
          promptText: req.prompt,
        }),
      },
    };
  }

  const raw = result.text;

  const inputHadEuWarn = inputGuardrails.ruleHit?.kind === "eu";
  const outputGuardrails = runOutputGuardrails(raw, inputHadEuWarn);
  const sanitized = applyOutputGuardrails(raw, inputHadEuWarn);

  const model = backend === "ollama" ? process.env.OLLAMA_MODEL ?? "llama2" : undefined;

  return {
    status: inputGuardrails.warnings.length > 0 ? "warn" : "ok",
    text: sanitized,
    meta: {
      backend,
      route,
      model,
      inputGuardrails,
      outputGuardrails,
      disclosure: "🤖 AI-generated · verify before trusting",
      resources: buildResourceSnapshot({
        activity: "prompt",
        backend,
        model,
        blocked: false,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        latencyMs: result.latencyMs,
        promptText: req.prompt,
        completionText: raw,
      }),
    },
  };
}
