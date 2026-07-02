"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./playground.module.css";

const TEMPLATES = [
  {
    label: "Explain simply",
    prompt:
      "Explain [topic] in plain language for a first-year student. Use one analogy. No jargon.",
  },
  {
    label: "Critique output",
    prompt:
      "Review this AI-generated paragraph for factual claims, bias, and missing citations. List 3 questions I should verify.",
  },
  {
    label: "Study plan",
    prompt:
      "Create a 30-minute study session on AI literacy covering deepfakes, bias, and safe prompting.",
  },
];

const CRITIQUE_CHECKLIST = [
  "I verified facts against a trusted source",
  "I checked for biased assumptions or stereotypes",
  "I added my own analysis — not just AI text",
  "I cited where AI helped and where I contributed",
];

export function PromptPlayground() {
  const [prompt, setPrompt] = useState(TEMPLATES[0].prompt);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  async function handleRun() {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          profile: "students-lecturers",
        }),
      });

      const data = await res.json();
      const meta = data.meta ?? {};
      const guardNote =
        meta.inputGuardrails?.warnings?.length > 0
          ? `\n\n⚠ Guardrails: ${meta.inputGuardrails.warnings.join("; ")}`
          : "";

      setOutput(
        `${data.text ?? "No response"}${guardNote}\n\n` +
          `— backend: ${meta.backend ?? "simulated"} · agent: ${meta.route ?? "general"} · ${meta.disclosure ?? ""}`
      );
    } catch {
      setOutput("Orchestrator request failed. Is the dev server running?");
    }

    setLoading(false);
  }

  return (
    <div className={styles.playground}>
      <h1 className={styles.title}>Prompt Playground</h1>
      <p className={styles.subtitle}>
        Draft prompts, review outputs, and practice the verify-before-you-trust workflow.
      </p>

      <div className={styles.templates}>
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            className={styles.templateBtn}
            onClick={() => setPrompt(t.prompt)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <span className={styles.panelTitle}>Your prompt</span>
          <textarea
            className={styles.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Prompt input"
          />
          <Button onClick={handleRun} disabled={loading || !prompt.trim()}>
            {loading ? "Thinking…" : "Run via orchestrator"}
          </Button>
        </div>

        <div className={styles.panel}>
          <span className={styles.panelTitle}>Output</span>
          <div className={styles.output} role="region" aria-live="polite" aria-label="AI output">
            {output || "Output will appear here…"}
          </div>
        </div>
      </div>

      <div className={styles.checklist}>
        <h3>Before you submit — critique checklist</h3>
        {CRITIQUE_CHECKLIST.map((item, i) => (
          <label key={item} className={styles.checkItem}>
            <input
              type="checkbox"
              checked={!!checks[i]}
              onChange={(e) => setChecks((prev) => ({ ...prev, [i]: e.target.checked }))}
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}
