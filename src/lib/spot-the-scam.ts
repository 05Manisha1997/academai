import bank from "../../content/scam/spot-the-scam-bank.json";

export interface ScamScenario {
  id: string;
  isScam: boolean;
  channel: "Text message" | "Email" | "Voicemail";
  sender: string;
  subject: string | null;
  body: string;
  redFlags: string[];
  safeSigns: string[];
  explanation: string;
  lesson: string;
}

export interface ScamBank {
  title: string;
  brand: string;
  scenarios: ScamScenario[];
}

export function getScamBank(): ScamBank {
  return bank as ScamBank;
}

export const SCAM_MODULE_SLUG = "spot-the-scam";

export function isScamModule(slug: string): boolean {
  return slug === SCAM_MODULE_SLUG;
}

export function shuffleIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
