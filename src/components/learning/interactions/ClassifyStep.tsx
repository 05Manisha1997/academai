"use client";

import { useState } from "react";
import styles from "./classify.module.css";

interface ClassifyItem {
  id: string;
  label: string;
  isReal: boolean;
}

interface ClassifyStepProps {
  items: ClassifyItem[];
  onComplete: (score: number) => void;
}

type Choice = "real" | "fake" | null;

export function ClassifyStep({ items, onComplete }: ClassifyStepProps) {
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [submitted, setSubmitted] = useState(false);

  const allChosen = items.every((item) => choices[item.id] != null);

  function setChoice(itemId: string, choice: Choice) {
    if (submitted) return;
    setChoices((prev) => ({ ...prev, [itemId]: choice }));
  }

  function handleSubmit() {
    if (!allChosen || submitted) return;
    setSubmitted(true);

    let correct = 0;
    for (const item of items) {
      const choice = choices[item.id];
      const isCorrect =
        (item.isReal && choice === "real") || (!item.isReal && choice === "fake");
      if (isCorrect) correct++;
    }
    onComplete(correct / items.length);
  }

  return (
    <div>
      <div className={styles.grid}>
        {items.map((item) => {
          const choice = choices[item.id];
          const isCorrect =
            submitted &&
            ((item.isReal && choice === "real") || (!item.isReal && choice === "fake"));
          const isWrong = submitted && !isCorrect;

          return (
            <div
              key={item.id}
              className={`${styles.item} ${isCorrect ? styles.itemCorrect : ""} ${isWrong ? styles.itemWrong : ""}`}
            >
              <span className={styles.itemLabel}>
                {item.id === "img-1" && "🎬 "}
                {item.id === "img-2" && "📷 "}
                {item.id === "img-3" && "📺 "}
                {item.label}
              </span>
              <div className={styles.binButtons} role="group" aria-label={`Classify ${item.label}`}>
                <button
                  type="button"
                  className={`${styles.binBtn} ${choice === "real" ? styles.binBtnActiveReal : ""}`}
                  onClick={() => setChoice(item.id, "real")}
                  disabled={submitted}
                >
                  Real
                </button>
                <button
                  type="button"
                  className={`${styles.binBtn} ${choice === "fake" ? styles.binBtnActiveFake : ""}`}
                  onClick={() => setChoice(item.id, "fake")}
                  disabled={submitted}
                >
                  Fake
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!submitted && (
        <button
          type="button"
          className={styles.binBtn}
          style={{
            marginTop: "1.25rem",
            width: "100%",
            padding: "0.85rem",
            background: allChosen ? "var(--aifa-primary)" : "var(--aifa-border)",
            color: allChosen ? "var(--aifa-text-on-primary, #fff)" : "var(--aifa-muted)",
            opacity: allChosen ? 1 : 0.7,
          }}
          onClick={handleSubmit}
          disabled={!allChosen}
        >
          Check my answers
        </button>
      )}
      {submitted && (
        <p className={styles.scoreBar}>
          {items.filter(
            (i) =>
              (i.isReal && choices[i.id] === "real") ||
              (!i.isReal && choices[i.id] === "fake")
          ).length}{" "}
          of {items.length} correct — great eye!
        </p>
      )}
    </div>
  );
}
