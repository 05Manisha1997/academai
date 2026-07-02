"use client";

import { useState } from "react";
import { PromptSandbox } from "@/components/students/PromptSandbox";
import { PromptPlayground } from "@/components/students/PromptPlayground";
import styles from "./playground.module.css";

type Tab = "sandbox" | "quick";

export default function PlaygroundPage() {
  const [tab, setTab] = useState<Tab>("sandbox");

  if (tab === "sandbox") {
    return (
      <div>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${styles.tabActive}`}
            onClick={() => setTab("sandbox")}
          >
            Prompt Sandbox
          </button>
          <button type="button" className={styles.tab} onClick={() => setTab("quick")}>
            Quick Playground
          </button>
        </div>
        <PromptSandbox />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.tabs}>
        <button type="button" className={styles.tab} onClick={() => setTab("sandbox")}>
          Prompt Sandbox
        </button>
        <button
          type="button"
          className={`${styles.tab} ${styles.tabActive}`}
          onClick={() => setTab("quick")}
        >
          Quick Playground
        </button>
      </div>
      <PromptPlayground />
    </div>
  );
}
