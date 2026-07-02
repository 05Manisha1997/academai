import { analyze, respond } from "@/lib/cadet/engine";
import type { ModelAdapter } from "../types";

/** Default adapter — no external API; uses Cadet templated responses */
export const simulatedAdapter: ModelAdapter = {
  name: "simulated",
  async generate({ prompt, route }) {
    const a = analyze(prompt);
    const reply = respond(prompt, a);
    return `${reply}\n\n— routed to **${route}** agent · simulated backend —`;
  },
};
