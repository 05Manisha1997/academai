import { analyze } from "@/lib/cadet/engine";

const VAGUE_PATTERNS = [
  /\bhelp\b/i,
  /\bnot sure\b/i,
  /\bidk\b/i,
  /\bi don'?t know\b/i,
  /\bconfused\b/i,
  /\bwhat should i\b/i,
  /\bno idea\b/i,
  /\bstuck\b/i,
  /^(hi|hello|hey|help)\.?$/i,
];

const HUMAN_REQUEST =
  /\b(human|real person|someone|advisor|agent|speak to|talk to a)\b/i;

export interface TriageResult {
  vague: boolean;
  wantsHuman: boolean;
  reasons: string[];
}

export function assessQuestion(text: string): TriageResult {
  const trimmed = text.trim();
  const a = analyze(trimmed);
  const reasons: string[] = [];

  if (a.words < 4) reasons.push("very short");
  if (a.score < 45) reasons.push("low clarity");
  if (!a.has.specific && !a.has.context) reasons.push("missing context");

  for (const pattern of VAGUE_PATTERNS) {
    if (pattern.test(trimmed)) {
      reasons.push("vague phrasing");
      break;
    }
  }

  const wantsHuman = HUMAN_REQUEST.test(trimmed);

  return {
    vague: reasons.length >= 2 || wantsHuman,
    wantsHuman,
    reasons,
  };
}
