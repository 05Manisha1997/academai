"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  analyze,
  cost,
  respond,
  responseTokens,
  scoreColor,
} from "@/lib/cadet/engine";
import { EXAMPLE_PROMPTS, MISSIONS, WELCOME_MESSAGE } from "@/lib/cadet/missions";
import { useOptionalResourceMonitor } from "@/components/shared/ResourceMonitorProvider";
import type { ChatMessage, MissionId, RuleHit, SandboxState } from "@/lib/cadet/types";
import styles from "./cadet-sandbox.module.css";

function freshState(): SandboxState {
  return {
    messages: [{ role: "agent", text: WELCOME_MESSAGE }],
    input: "",
    running: false,
    mode: "live",
    credits: 6000,
    active: 0,
    done: {},
    popup: null,
    pending: null,
  };
}

export function CadetSandbox() {
  const [state, setState] = useState<SandboxState>(freshState);
  const [iconError, setIconError] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const resources = useOptionalResourceMonitor();

  const draftAnalysis = useMemo(() => analyze(state.input), [state.input]);
  const draftEmpty = !state.input.trim();
  const score = draftEmpty ? 0 : draftAnalysis.score;
  const qColor = scoreColor(score);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.messages, state.running]);

  const complete = useCallback((id: MissionId) => {
    setState((s) => (s.done[id] ? s : { ...s, done: { ...s.done, [id]: true } }));
  }, []);

  const sendToAgent = useCallback(
    (raw: string, a: ReturnType<typeof analyze>) => {
      setState((s) => ({ ...s, running: true }));
      const outTokens = responseTokens(a.score);

      window.setTimeout(() => {
        setState((s) => {
          const spent = a.tokens + outTokens;
          const done = { ...s.done, first: true as const };
          if (a.score >= 60) done.context = true;
          if (a.has.role) done.role = true;
          if (a.tokens <= 30 && a.score >= 50) done.tokens = true;

          const reply =
            respond(raw, a) +
            `\n\n· used ${spent} tokens (${a.tokens} in + ${outTokens} out)`;

          resources?.recordSimulatedPrompt({
            prompt: raw,
            completion: reply,
            latencyMs: 750,
          });

          return {
            ...s,
            running: false,
            credits: Math.max(0, s.credits - spent),
            done,
            messages: [...s.messages, { role: "agent", text: reply }],
          };
        });
      }, 750);
    },
    [resources]
  );

  const sendToOrchestrator = useCallback(
    async (raw: string, a: ReturnType<typeof analyze>) => {
      setState((s) => ({ ...s, running: true }));
      const outTokens = responseTokens(a.score);

      try {
        const res = await fetch("/api/orchestrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: raw,
            profile: "students-lecturers",
          }),
        });

        const data = await res.json();
        resources?.recordFromOrchestrate(data);
        const spent = a.tokens + outTokens;
        const meta = data.meta ?? {};
        const backend = meta.backend ?? "orchestrator";
        const route = meta.route ?? "general";

        setState((s) => {
          const done = { ...s.done, first: true as const };
          if (a.score >= 60) done.context = true;
          if (a.has.role) done.role = true;
          if (a.tokens <= 30 && a.score >= 50) done.tokens = true;

          const blocked = data.status === "blocked";
          const body =
            typeof data.text === "string"
              ? data.text
              : "No response from orchestrator.";
          const footer = blocked
            ? "\n\n· blocked by guardrails — no model tokens spent"
            : `\n\n· ${backend} · ${route} · used ~${spent} tokens (${a.tokens} in + ${outTokens} out)`;

          return {
            ...s,
            running: false,
            credits: blocked ? s.credits : Math.max(0, s.credits - spent),
            done,
            messages: [...s.messages, { role: "agent", text: body + footer }],
          };
        });
      } catch {
        setState((s) => ({
          ...s,
          running: false,
          messages: [
            ...s.messages,
            {
              role: "agent",
              text:
                "Orchestrator unreachable. Check that `npm run dev` is running and Ollama is started (`ollama serve`).\n\nSwitch to **Simulated** mode to practise offline.",
            },
          ],
        }));
      }
    },
    [resources]
  );

  const dispatchAgent = useCallback(
    (raw: string, a: ReturnType<typeof analyze>, mode: SandboxState["mode"]) => {
      if (mode === "live") {
        void sendToOrchestrator(raw, a);
      } else {
        sendToAgent(raw, a);
      }
    },
    [sendToAgent, sendToOrchestrator]
  );

  const openPopup = useCallback((flag: RuleHit, pending: SandboxState["pending"]) => {
    setState((s) => ({ ...s, popup: flag, pending }));
  }, []);

  const run = useCallback(() => {
    const raw = state.input.trim();
    if (!raw || state.running) return;

    const a = analyze(raw);
    setState((s) => ({
      ...s,
      messages: [...s.messages, { role: "user", text: raw }],
      input: "",
    }));

    if (a.flag) {
      complete(a.flag.kind === "eu" ? "rules" : "risk");
      if (a.flag.severity === "block") {
        openPopup(a.flag, null);
        window.setTimeout(() => {
          setState((s) => ({
            ...s,
            messages: [
              ...s.messages,
              {
                role: "agent",
                text: "I'm not able to help with that one — check the note that just popped up to see why. No tokens were spent. ✋",
              },
            ],
          }));
        }, 350);
      } else {
        openPopup(a.flag, { raw, a });
      }
      return;
    }

    dispatchAgent(raw, a, state.mode);
  }, [state.input, state.running, state.mode, complete, openPopup, dispatchAgent]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      run();
    }
  };

  const popupRewrite = () => {
    const last = [...state.messages].reverse().find((m) => m.role === "user");
    setState((s) => ({
      ...s,
      popup: null,
      pending: null,
      input: last?.text ?? s.input,
    }));
  };

  const popupContinue = () => {
    const p = state.pending;
    const f = state.popup;
    if (f?.kind === "eu") complete("rules");
    setState((s) => ({ ...s, popup: null, pending: null }));
    if (p) dispatchAgent(p.raw, p.a, state.mode);
  };

  const reset = () => setState(freshState());

  const completedCount = MISSIONS.filter((m) => state.done[m.id]).length;
  const creditPct = `${Math.round((state.credits / 6000) * 100)}%`;
  const activeMission = MISSIONS[state.active];

  const f = draftEmpty ? null : draftAnalysis.flag;
  const composerBorder = f
    ? f.severity === "block"
      ? "#E23D43"
      : "#E8911C"
    : score >= 70
      ? "#1F9E6F"
      : "#EADFCB";

  const liveSafety =
    f && f.kind === "safety"
      ? f.severity === "block"
        ? { label: "Blocked", color: "#E23D43", bg: "rgba(226,61,67,.12)" }
        : { label: "Caution", color: "#E8911C", bg: "rgba(232,145,28,.14)" }
      : { label: "Clear", color: "#1F9E6F", bg: "rgba(31,158,111,.12)" };

  const liveEu =
    f && f.kind === "eu"
      ? f.severity === "block"
        ? { label: "Prohibited", color: "#E23D43", bg: "rgba(226,61,67,.12)" }
        : { label: "Disclose", color: "#E8911C", bg: "rgba(232,145,28,.14)" }
      : { label: "OK", color: "#1F9E6F", bg: "rgba(31,158,111,.12)" };

  const qNote = draftEmpty
    ? "Start typing — I'll grade your prompt as you go."
    : score >= 70
      ? "Excellent — clear, specific, well-shaped."
      : score >= 40
        ? "Decent start. Add one more ingredient below."
        : "Too vague. The agent will have to guess what you want.";

  const checks = [
    { label: "Be specific", hint: "12+ words of detail", ok: draftAnalysis.has.specific },
    { label: "Give context", hint: "Your goal or the why", ok: draftAnalysis.has.context },
    { label: "Assign a role", hint: '"Act as a…"', ok: draftAnalysis.has.role },
    { label: "Ask for a format", hint: "Bullets, steps, length", ok: draftAnalysis.has.format },
    { label: "Name the audience", hint: "Who it's for", ok: draftAnalysis.has.audience },
  ];

  const popupHeaderBg = state.popup
    ? state.popup.severity === "block"
      ? state.popup.kind === "eu"
        ? "#2F5BEA"
        : "#E23D43"
      : "#E8911C"
    : "#E23D43";

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            {iconError ? (
              "C"
            ) : (
              <Image
                src="/brand/cadet-icon.png"
                alt="Cadet"
                width={28}
                height={28}
                className={styles.logoImg}
                onError={() => setIconError(true)}
              />
            )}
          </div>
          <div>
            <div className={styles.brandText}>Prevent</div>
            <div className={styles.brandSub}>SANDBOX</div>
          </div>
        </div>
        <div className={styles.progress}>
          <span>Progress</span>
          <div className={styles.dots}>
            {MISSIONS.map((m) => (
              <span
                key={m.id}
                className={`${styles.dot} ${state.done[m.id] ? styles.dotDone : ""}`}
              />
            ))}
          </div>
          <span>
            {completedCount}/{MISSIONS.length}
          </span>
        </div>
        <div className={styles.credits}>
          <div className={styles.modeToggle} role="group" aria-label="Sandbox mode">
            <button
              type="button"
              className={`${styles.modeBtn} ${state.mode === "live" ? styles.modeBtnActive : ""}`}
              onClick={() => setState((s) => ({ ...s, mode: "live" }))}
            >
              Live · Llama 2
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${state.mode === "simulated" ? styles.modeBtnActive : ""}`}
              onClick={() => setState((s) => ({ ...s, mode: "simulated" }))}
            >
              Simulated
            </button>
          </div>
          <span style={{ fontFamily: "var(--cadet-mono-font)" }}>
            {state.credits.toLocaleString()} credits
          </span>
          <div className={styles.creditBar}>
            <div className={styles.creditFill} style={{ width: creditPct }} />
          </div>
          <button type="button" className={styles.resetBtn} onClick={reset}>
            Reset
          </button>
        </div>
      </header>

      <div className={styles.main}>
        <aside className={styles.rail}>
          <h2>Missions</h2>
          {MISSIONS.map((m, i) => {
            const done = !!state.done[m.id];
            const active = i === state.active;
            return (
              <button
                key={m.id}
                type="button"
                className={`${styles.mission} ${active ? styles.missionActive : ""} ${done ? styles.missionDone : ""}`}
                onClick={() => setState((s) => ({ ...s, active: i }))}
              >
                <span className={styles.missionNum}>{done ? "✓" : i + 1}</span>
                <div>
                  <div className={styles.missionTitle}>{m.title}</div>
                  <div className={styles.missionObj}>{m.objective}</div>
                </div>
              </button>
            );
          })}
          <div className={styles.nowPlaying}>
            <strong>Now playing: {activeMission.title}</strong>
            {activeMission.hint}
          </div>
        </aside>

        <section className={styles.terminal}>
          <div className={styles.transcript} ref={transcriptRef}>
            {state.messages.map((m: ChatMessage, i) => (
              <div
                key={i}
                className={`${styles.bubbleWrap} ${m.role === "user" ? styles.bubbleWrapUser : ""}`}
              >
                <span
                  className={`${styles.bubbleLabel} ${m.role === "agent" ? styles.bubbleLabelAgent : ""}`}
                >
                  {m.role === "user" ? "You" : "🤖 Sandbox agent"}
                </span>
                <div
                  className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAgent}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {state.running && (
              <div className={styles.typing} aria-label="Agent typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>TRY:</span>
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className={`${styles.chip} ${ex.variant === "warn" ? styles.chipWarn : ""} ${ex.variant === "eu" ? styles.chipEu : ""}`}
                onClick={() => setState((s) => ({ ...s, input: ex.text }))}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className={styles.disclosure}>
            {state.mode === "live" ? (
              <>
                🔒 Guardrailed · prompts go through academAI orchestrator (Ollama / Llama 2 locally) ·
                nothing is stored · 🤖 verify before you trust
              </>
            ) : (
              <>
                🔒 Private sandbox · runs on your device — nothing you type is stored or sent · 🤖
                you&apos;re practising with a simulated AI, not a real person
              </>
            )}
          </div>

          <div className={styles.composer} style={{ ["--cadet-composer-border" as string]: composerBorder }}>
            <textarea
              className={styles.textarea}
              value={state.input}
              onChange={(e) => setState((s) => ({ ...s, input: e.target.value }))}
              onKeyDown={onKey}
              placeholder="Type a prompt…"
              aria-label="Prompt input"
            />
            <div className={styles.composerFooter}>
              <span>
                {draftAnalysis.tokens} tokens · ≈ {cost(draftAnalysis.tokens)} ·{" "}
                {liveSafety.label}
              </span>
              <button
                type="button"
                className={styles.runBtn}
                onClick={run}
                disabled={!state.input.trim() || state.running}
              >
                Run ▸
              </button>
            </div>
          </div>
        </section>

        <aside className={styles.coach}>
          <h2>⭐ Prompt Coach</h2>
          <p className={styles.coachSub}>Live grading as you type</p>

          <div className={styles.gauge}>
            <div className={styles.gaugeHeader}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>Quality</span>
              <span className={styles.gaugeScore} style={{ color: qColor }}>
                {score}%
              </span>
            </div>
            <div className={styles.gaugeBar}>
              <div
                className={styles.gaugeFill}
                style={{ width: `${score}%`, background: qColor }}
              />
            </div>
            <p className={styles.gaugeNote}>{qNote}</p>
          </div>

          <p style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Ingredients of a great prompt
          </p>
          <div className={styles.checklist}>
            {checks.map((c) => (
              <div key={c.label} className={styles.checkRow}>
                <span className={`${styles.checkDot} ${c.ok ? styles.checkDotOk : ""}`}>
                  {c.ok ? "✓" : ""}
                </span>
                <div>
                  <strong>{c.label}</strong>
                  <div style={{ color: "var(--cadet-faint)" }}>{c.hint}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pills}>
            <div className={styles.pillRow}>
              <span>Token cost</span>
              <span style={{ fontFamily: "var(--cadet-mono-font)" }}>
                {cost(draftAnalysis.tokens)}
              </span>
            </div>
            <div className={styles.pillRow}>
              <span>Safety scan</span>
              <span className={styles.pill} style={{ color: liveSafety.color, background: liveSafety.bg }}>
                {liveSafety.label}
              </span>
            </div>
            <div className={styles.pillRow}>
              <span>EU AI Act</span>
              <span className={styles.pill} style={{ color: liveEu.color, background: liveEu.bg }}>
                {liveEu.label}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {state.popup && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader} style={{ background: popupHeaderBg }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.9 }}>
                {state.popup.icon} {state.popup.kicker}
              </div>
              <h3 style={{ margin: "0.35rem 0 0", fontSize: "1.15rem" }}>{state.popup.title}</h3>
            </div>
            <div className={styles.modalBody}>
              <p>{state.popup.body}</p>
              <div className={styles.modalRef}>
                <span className={styles.refTag} style={{ background: state.popup.refBg }}>
                  {state.popup.refTag}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--cadet-muted)" }}>
                  {state.popup.refText}
                </span>
              </div>
              <p style={{ marginTop: "1rem" }}>
                <strong>Try instead:</strong> {state.popup.fix}
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                onClick={popupRewrite}
              >
                Rewrite my prompt
              </button>
              {state.popup.severity === "warn" && (
                <button
                  type="button"
                  className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                  style={{ background: popupHeaderBg }}
                  onClick={popupContinue}
                >
                  I understand — continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
