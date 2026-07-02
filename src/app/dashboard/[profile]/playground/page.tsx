"use client";

import { useState } from "react";
import { CadetSandbox } from "@/components/students/CadetSandbox";
import { PromptPlayground } from "@/components/students/PromptPlayground";
import styles from "./playground.module.css";

type Tab = "cadet" | "quick";

export default function PlaygroundPage() {
  const [tab, setTab] = useState<Tab>("cadet");

  if (tab === "cadet") {
    return (
      <div>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${styles.tabActive}`}
            onClick={() => setTab("cadet")}
          >
            Cadet Sandbox
          </button>
          <button type="button" className={styles.tab} onClick={() => setTab("quick")}>
            Quick Playground
          </button>
        </div>
        <CadetSandbox />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.tabs}>
        <button type="button" className={styles.tab} onClick={() => setTab("cadet")}>
          Cadet Sandbox
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
