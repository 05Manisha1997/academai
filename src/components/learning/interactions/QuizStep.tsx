"use client";

import { useState } from "react";
import styles from "./quiz.module.css";

interface QuizOption {
  id: string;
  label: string;
  correct: boolean;
}

interface QuizStepProps {
  question: string;
  options: QuizOption[];
  feedbackCorrect?: string;
  feedbackWrong?: string;
  onComplete: (score: number) => void;
}

export function QuizStep({
  question,
  options,
  feedbackCorrect = "Well done!",
  feedbackWrong = "Not quite — try again.",
  onComplete,
}: QuizStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  function handleSelect(id: string) {
    if (answered) return;
    const option = options.find((o) => o.id === id);
    if (!option) return;

    setSelected(id);
    setAnswered(true);

    if (option.correct) {
      onComplete(1);
    } else {
      onComplete(0);
    }
  }

  const selectedOption = options.find((o) => o.id === selected);

  return (
    <div>
      <p className={styles.question} style={{ fontWeight: 600, marginBottom: "1rem" }}>
        {question}
      </p>
      <div className={styles.options} role="group" aria-label={question}>
        {options.map((opt) => {
          let className = styles.option;
          if (answered && opt.id === selected) {
            className += opt.correct ? ` ${styles.optionCorrect}` : ` ${styles.optionWrong}`;
          } else if (answered && opt.correct) {
            className += ` ${styles.optionCorrect}`;
          }

          return (
            <button
              key={opt.id}
              type="button"
              className={className}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <p
          className={`${styles.feedback} ${
            selectedOption?.correct ? styles.feedbackSuccess : styles.feedbackError
          }`}
        >
          {selectedOption?.correct ? feedbackCorrect : feedbackWrong}
        </p>
      )}
    </div>
  );
}
