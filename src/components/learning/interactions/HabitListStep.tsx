"use client";

import { useState } from "react";
import styles from "./habit-list.module.css";

interface HabitListStepProps {
  habits: string[];
  minSelections?: number;
  prompt?: string;
  onComplete: () => void;
}

export function HabitListStep({
  habits,
  minSelections = 2,
  prompt = "Tap to rank what matters most to you (tap again to undo):",
  onComplete,
}: HabitListStepProps) {
  const [order, setOrder] = useState<string[]>([]);

  function toggle(habit: string) {
    setOrder((prev) => {
      if (prev.includes(habit)) {
        return prev.filter((h) => h !== habit);
      }
      return [...prev, habit];
    });
  }

  const done = order.length >= minSelections;

  return (
    <div>
      <p className={styles.hint}>{prompt}</p>
      <div className={styles.list}>
        {habits.map((habit) => {
          const rankIndex = order.indexOf(habit);
          const selected = rankIndex >= 0;

          return (
            <button
              key={habit}
              type="button"
              className={`${styles.habit} ${selected ? styles.habitSelected : ""}`}
              onClick={() => toggle(habit)}
            >
              <span
                className={`${styles.rank} ${selected ? styles.rankActive : ""}`}
                aria-hidden
              >
                {selected ? rankIndex + 1 : "·"}
              </span>
              {habit}
            </button>
          );
        })}
      </div>
      {done && (
        <button
          type="button"
          style={{
            marginTop: "1.25rem",
            width: "100%",
            padding: "0.85rem",
            borderRadius: "var(--aifa-radius)",
            background: "var(--aifa-primary)",
            color: "var(--aifa-text-on-primary, #fff)",
            fontWeight: 700,
            fontSize: "1rem",
          }}
          onClick={onComplete}
        >
          Save my checklist
        </button>
      )}
    </div>
  );
}
