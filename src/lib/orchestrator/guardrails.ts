import { analyze, scan } from "@/lib/cadet/engine";
import type { GuardrailResult } from "./types";

const MAX_PROMPT_CHARS = 8000;
const MAX_OUTPUT_CHARS = 12000;

/** Input guardrails: Cadet rules engine + length + empty check */
export function runInputGuardrails(prompt: string): GuardrailResult {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { passed: false, blocked: true, warnings: ["Empty prompt"] };
  }
  if (trimmed.length > MAX_PROMPT_CHARS) {
    return {
      passed: false,
      blocked: true,
      warnings: [`Prompt exceeds ${MAX_PROMPT_CHARS} characters`],
    };
  }

  const ruleHit = scan(trimmed.toLowerCase());
  if (ruleHit?.severity === "block") {
    return {
      passed: false,
      blocked: true,
      warnings: [ruleHit.title],
      ruleHit,
    };
  }

  const analysis = analyze(trimmed);
  const warnings: string[] = [];
  if (ruleHit?.severity === "warn") {
    warnings.push(ruleHit.title);
  }
  if (analysis.score < 30) {
    warnings.push("Prompt is very vague — consider adding context and format");
  }

  return {
    passed: true,
    blocked: false,
    warnings,
    ruleHit: ruleHit ?? null,
  };
}

/** Output guardrails: length, disclosure for EU transparency, basic PII patterns */
export function runOutputGuardrails(text: string, inputHadEuWarn = false): GuardrailResult {
  if (!text.trim()) {
    return { passed: false, blocked: true, warnings: ["Empty model output"] };
  }

  let sanitized = text;
  const warnings: string[] = [];

  if (sanitized.length > MAX_OUTPUT_CHARS) {
    sanitized = sanitized.slice(0, MAX_OUTPUT_CHARS) + "\n\n[truncated for safety]";
    warnings.push("Output truncated to max length");
  }

  // Redact obvious PII patterns in displayed output
  sanitized = sanitized
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[PHONE REDACTED]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL REDACTED]");

  if (inputHadEuWarn && !/ai-generated|artificially generated/i.test(sanitized)) {
    sanitized = "[AI-generated content]\n\n" + sanitized;
    warnings.push("EU transparency label prepended (Art. 50)");
  }

  return {
    passed: true,
    blocked: false,
    warnings,
  };
}
