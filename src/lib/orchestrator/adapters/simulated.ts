import { analyze, respond, estTokens } from "@/lib/cadet/engine";
import type { ModelAdapter } from "../types";

/** Default adapter — no external API; uses Cadet templated responses */
export const simulatedAdapter: ModelAdapter = {
  name: "simulated",
  async generate({ prompt, route }) {
    const started = Date.now();
    const a = analyze(prompt);
    const reply = respond(prompt, a);
    const text = `${reply}\n\n— routed to **${route}** agent · simulated backend —`;
    return {
      text,
      promptTokens: estTokens(prompt),
      completionTokens: estTokens(reply),
      latencyMs: Date.now() - started,
    };
  },
};