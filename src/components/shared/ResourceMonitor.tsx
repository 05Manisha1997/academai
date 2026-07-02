"use client";

import { useState } from "react";
import {
  formatCo2,
  formatTokens,
  formatWh,
} from "@/lib/resource-footprint";
import { useResourceMonitor } from "./ResourceMonitorProvider";
import styles from "./resource-monitor.module.css";

interface ResourceMonitorProps {
  section?: "learn" | "practice" | "prevent" | "home" | "dashboard";
}

export function ResourceMonitor({ section = "home" }: ResourceMonitorProps) {
  const { session, reset } = useResourceMonitor();
  const [open, setOpen] = useState(false);

  const last = session.last;
  const hasActivity = session.prompts > 0 || session.learningSteps > 0;

  const collapsedSummary = hasActivity
    ? `${formatCo2(session.co2g)} · ${formatTokens(session.totalTokens)} tok`
    : "No activity yet";

  return (
    <aside
      className={styles.resourceMonitor}
      data-section={section}
      aria-label="Environmental resource monitor"
    >
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="resource-monitor-panel"
      >
        <span className={styles.icon} aria-hidden>
          🌿
        </span>
        <span className={styles.summary}>
          <span className={styles.summaryTitle}>Resource footprint</span>
          <span className={styles.summaryValue}>{collapsedSummary}</span>
        </span>
        <span className={styles.chevron} aria-hidden>
          {open ? "▾" : "▴"}
        </span>
      </button>

      {open && (
        <div className={styles.panel} id="resource-monitor-panel">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>This session</span>
            {hasActivity && (
              <button type="button" className={styles.resetBtn} onClick={reset}>
                Reset
              </button>
            )}
          </div>

          {!hasActivity ? (
            <p className={styles.idle}>
              Prompt or complete a lesson step — estimates for tokens, energy, and CO₂e will
              appear here.
            </p>
          ) : (
            <>
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Totals</span>
                <div className={styles.grid}>
                  <div className={styles.stat}>
                    <span className={styles.statKey}>Prompts</span>
                    <span className={styles.statVal}>{session.prompts}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statKey}>Lesson steps</span>
                    <span className={styles.statVal}>{session.learningSteps}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statKey}>Tokens</span>
                    <span className={styles.statVal}>{formatTokens(session.totalTokens)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statKey}>Energy (est.)</span>
                    <span className={styles.statVal}>{formatWh(session.energyWh)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statKey}>CO₂e (est.)</span>
                    <span className={styles.statVal}>{formatCo2(session.co2g)}</span>
                  </div>
                </div>
              </div>

              {last && (
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>Last activity</span>
                  <p className={styles.lastLine}>
                    {last.label}
                    {last.latencyMs > 0 ? ` · ${last.latencyMs} ms` : ""}
                    {last.totalTokens > 0
                      ? ` · ${formatTokens(last.promptTokens)} in / ${formatTokens(last.completionTokens)} out`
                      : ""}
                  </p>
                </div>
              )}
            </>
          )}

          <p className={styles.disclaimer}>
            Educational estimates for on-device inference. Actual energy and emissions depend on
            your hardware and power grid.
          </p>
        </div>
      )}
    </aside>
  );
}
