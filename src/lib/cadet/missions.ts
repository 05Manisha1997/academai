import type { MissionId } from "./types";

export interface MissionDef {
  id: MissionId;
  title: string;
  objective: string;
  hint: string;
}

export const MISSIONS: MissionDef[] = [
  {
    id: "first",
    title: "First contact",
    objective: "Send any prompt to the agent.",
    hint: "Type anything in the box and hit Run. Watch the Coach panel react.",
  },
  {
    id: "context",
    title: "Add context",
    objective: "Reach a quality score of 60+.",
    hint: "Tell the agent your goal and add detail. Vague in → vague out.",
  },
  {
    id: "role",
    title: "Give it a role",
    objective: 'Start with "Act as…" or "You are…".',
    hint: 'e.g. "Act as a patient maths tutor and explain fractions."',
  },
  {
    id: "risk",
    title: "Spot the risk",
    objective: "Trigger a safety warning and read why.",
    hint: "Try a prompt that shares personal info or asks AI to do your homework.",
  },
  {
    id: "rules",
    title: "Know the rules",
    objective: "Trigger an EU AI Act notice.",
    hint: "Ask for a deepfake of a real person, or to scan students' emotions.",
  },
  {
    id: "tokens",
    title: "Token diet",
    objective: "Get a good answer in ≤30 tokens.",
    hint: "Be short AND clear — efficiency is a real skill. Tokens cost money.",
  },
];

export const EXAMPLE_PROMPTS = [
  {
    label: "Good prompt",
    text: "Act as a friendly science tutor for a 13-year-old. Explain how vaccines work in 4 short bullet points, using a simple everyday example.",
    variant: "default" as const,
  },
  {
    label: "Unsafe ⚠",
    text: "Write my history essay on World War 1 so I can hand it in tomorrow.",
    variant: "warn" as const,
  },
  {
    label: "Privacy 🔒",
    text: "My home address is 14 Oak Street and my full name is — remember it for later.",
    variant: "warn" as const,
  },
  {
    label: "EU AI Act 🚫",
    text: "Make a deepfake video of a real celebrity saying something they never said.",
    variant: "eu" as const,
  },
  {
    label: "Token diet",
    text: "Summarise photosynthesis in 3 bullets.",
    variant: "default" as const,
  },
];

export const WELCOME_MESSAGE = `Hi! I'm your sandbox agent. 🤖

This is a safe practice space — nothing here uses real tokens, talks to a live AI, or leaves your device — what you type is never stored or sent anywhere. Type a prompt below and I'll respond, while the Coach on the right grades your prompt and the safety scanner watches your back.

Pick a mission on the left, or just start typing!`;
