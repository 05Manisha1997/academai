"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./read-aloud.module.css";

interface ReadAloudButtonProps {
  text: string;
  label?: string;
}

export function ReadAloudButton({
  text,
  label = "🔊 Read Aloud",
}: ReadAloudButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [text, stop]);

  useEffect(() => () => stop(), [stop]);

  if (typeof window !== "undefined" && !window.speechSynthesis) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.readAloud} ${speaking ? styles.readAloudActive : ""}`}
        onClick={speaking ? stop : speak}
        aria-pressed={speaking}
      >
        {speaking ? "⏹ Stop" : label}
      </button>
    </div>
  );
}
