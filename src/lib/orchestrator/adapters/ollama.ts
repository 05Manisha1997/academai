import type { ModelAdapter } from "../types";

/**
 * Llama 2 / Llama 3 via Ollama (local or hosted).
 * Set OLLAMA_BASE_URL (default http://localhost:11434) and OLLAMA_MODEL (default llama2).
 */
export const ollamaAdapter: ModelAdapter = {
  name: "ollama",
  async generate({ prompt, system, route }) {
    const started = Date.now();
    const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL ?? "llama2";

    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: `${system}\nRoute: ${route}` },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error (${res.status}): ${err.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
      total_duration?: number;
    };

    return {
      text: data.message?.content ?? "",
      promptTokens: data.prompt_eval_count,
      completionTokens: data.eval_count,
      latencyMs: data.total_duration
        ? Math.round(data.total_duration / 1_000_000)
        : Date.now() - started,
    };
  },
};