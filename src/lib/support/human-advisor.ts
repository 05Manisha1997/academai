import { orchestrate } from "@/lib/orchestrator/pipeline";
import type { AudienceProfile } from "@/types/profiles";
import { assessQuestion } from "./triage";

const HUMAN_FALLBACKS = [
  "Thanks for waiting — I'm a human advisor. Could you tell me a bit more about what you're trying to do on academAI? For example: which section (Learn, Practice, Prevent) and what felt confusing?",
  "I can help with that. To point you in the right direction, what have you already tried, and what outcome are you hoping for?",
  "Good question. A human touch helps here — are you asking about a specific lesson, Prompt Sandbox, or something about AI safety in general?",
];

function stripSimulatedArtifacts(text: string): string {
  return text
    .replace(/\n*— routed to \*\*[^*]+\*\* agent · simulated backend —/gi, "")
    .replace(/— sandbox preview[^\n]*/gi, "")
    .replace(/\[truncated[^\]]*\]/gi, "")
    .trim();
}

function pickHumanReply(prompt: string, wantsHuman: boolean): string {
  const lower = prompt.toLowerCase();
  if (/\bsandbox|prompt\b/.test(lower)) {
    return "I'm here to help with Prompt Sandbox. Are you trying to write a better prompt, understand guardrails, or switch between Live and Simulated mode?";
  }
  if (/\blearn|lesson|module\b/.test(lower)) {
    return "Happy to walk you through a lesson. Which module are you on, and what part felt unclear — the instructions, a quiz, or something else?";
  }
  if (/\bsafe|scam|deepfake|guardrail\b/.test(lower)) {
    return "Safety questions are important. Tell me what situation you're worried about — spotting scams, deepfakes, or safe prompting — and I'll guide you step by step.";
  }
  const idx = wantsHuman ? 0 : prompt.length % HUMAN_FALLBACKS.length;
  return HUMAN_FALLBACKS[idx];
}

export async function generateBotReply(prompt: string, profile: AudienceProfile): Promise<string> {
  const wrapped =
    `[Support centre — answer briefly in 2-4 sentences, plain language]\n` +
    `User question: ${prompt}`;

  const result = await orchestrate({ prompt: wrapped, profile, backend: "simulated" });

  if (result.status === "blocked") {
    return result.text;
  }

  return stripSimulatedArtifacts(result.text);
}

export async function generateHumanReply(
  prompt: string,
  _profile: AudienceProfile,
  _history: string[]
): Promise<string> {
  const triage = assessQuestion(prompt);
  return pickHumanReply(prompt, triage.wantsHuman);
}

export function escalationNotice(): string {
  return (
    "Your question is a bit broad for the bot — I'm connecting you with a human advisor now. " +
    "They'll join shortly. Please stay on this page."
  );
}
