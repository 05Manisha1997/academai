"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { LessonScript, ScriptBeat } from "@/lib/scripts";
import { useEngagement } from "@/components/shared/EngagementProvider";
import { ReadAloudButton } from "@/components/elderly/ReadAloudButton";
import { Button } from "@/components/ui/Button";
import { QuizStep } from "./interactions/QuizStep";
import styles from "./elderly-script.module.css";

const BEAT_EMOJI = ["🐕", "🦴", "❤️", "⭐"];

interface ElderlyScriptRunnerProps {
  script: LessonScript;
  profile: string;
}

export function ElderlyScriptRunner({ script, profile }: ElderlyScriptRunnerProps) {
  const { track } = useEngagement();
  const [beatIndex, setBeatIndex] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const beat = script.script[beatIndex];
  const isLast = beatIndex === script.script.length - 1;

  const advance = useCallback(() => {
    if (isLast) {
      track("module_completed");
      setFinished(true);
    } else {
      setBeatIndex((i) => i + 1);
      setQuizDone(false);
      setChecklist([]);
    }
  }, [isLast, track]);

  if (finished) {
    return (
      <div className={styles.runner}>
        <div className={styles.completion}>
          <div className={styles.visual}>🐕⭐</div>
          <h2>Well Done!</h2>
          <p style={{ fontSize: "1.2rem", color: "var(--aifa-muted)", marginBottom: "1.5rem" }}>
            You&apos;ve trained your super-smart puppy.
          </p>
          <Link href={`/dashboard/${profile}`}>
            <Button size="xl" fullWidth>
              Return to My Safety Dashboard
            </Button>
          </Link>
          <Link
            href={`/dashboard/${profile}/modules/spot-the-deepfake`}
            style={{ display: "block", marginTop: "1rem", textAlign: "center", color: "var(--aifa-primary)" }}
          >
            Next: Spot the Deepfake →
          </Link>
        </div>
      </div>
    );
  }

  if (!beat) return null;

  const fullNarration = `${beat.onScreen.headline}. ${beat.narrator}`;

  return (
    <div className={styles.runner}>
      <Link href={`/dashboard/${profile}`} style={{ color: "var(--aifa-muted)", fontSize: "0.95rem" }}>
        ← Back
      </Link>

      <h1 style={{ fontSize: "1.5rem", margin: "1rem 0 0.5rem", fontWeight: 800 }}>
        {script.title}
      </h1>

      <div className={styles.progress} aria-label={`Beat ${beat.beat} of ${script.script.length}`}>
        {script.script.map((b, i) => (
          <span
            key={b.beat}
            className={`${styles.dot} ${i === beatIndex ? styles.dotActive : ""} ${i < beatIndex ? styles.dotDone : ""}`}
          />
        ))}
      </div>

      <div className={styles.card}>
        <ReadAloudButton text={fullNarration} />

        <div className={styles.visual} aria-hidden>
          {BEAT_EMOJI[beatIndex] ?? "🐕"}
        </div>

        <h2 className={styles.headline}>{beat.onScreen.headline}</h2>
        <p className={styles.narrator}>{beat.narrator}</p>

        {beat.onScreen.callout && (
          <p className={styles.callout}>{beat.onScreen.callout}</p>
        )}

        {beat.onScreen.safetyTip && (
          <div className={styles.safety}>
            <strong>Safety tip</strong>
            {beat.onScreen.safetyTip}
          </div>
        )}

        <BeatInteraction
          beat={beat}
          quizDone={quizDone}
          checklist={checklist}
          onQuizDone={() => setQuizDone(true)}
          onChecklistToggle={(item) => {
            setChecklist((prev) =>
              prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
            );
          }}
          onAdvance={advance}
        />
      </div>
    </div>
  );
}

interface BeatInteractionProps {
  beat: ScriptBeat;
  quizDone: boolean;
  checklist: string[];
  onQuizDone: () => void;
  onChecklistToggle: (item: string) => void;
  onAdvance: () => void;
}

function BeatInteraction({
  beat,
  quizDone,
  checklist,
  onQuizDone,
  onChecklistToggle,
  onAdvance,
}: BeatInteractionProps) {
  const interaction = beat.interaction;
  const type = interaction.type as string;

  if (type === "voice-prompt") {
    return (
      <div className={styles.actions}>
        <p style={{ color: "var(--aifa-muted)", fontSize: "1.05rem" }}>
          {interaction.prompt as string}
        </p>
        <Button size="xl" fullWidth onClick={onAdvance}>
          {(interaction.fallbackButton as string) ?? "Continue"}
        </Button>
      </div>
    );
  }

  if (type === "quiz") {
    const options = interaction.options as { id: string; label: string; correct: boolean }[];
    return (
      <div>
        {!quizDone ? (
          <QuizStep
            question={interaction.question as string}
            options={options}
            feedbackCorrect={interaction.feedbackCorrect as string}
            feedbackWrong={interaction.feedbackWrong as string}
            onComplete={() => onQuizDone()}
          />
        ) : (
          <Button size="xl" fullWidth onClick={onAdvance}>
            Continue →
          </Button>
        )}
      </div>
    );
  }

  if (type === "checklist") {
    const items = interaction.items as string[];
    const min = (interaction.minSelections as number) ?? 2;
    const done = checklist.length >= min;

    return (
      <div>
        <p style={{ marginBottom: "1rem", fontWeight: 600 }}>
          {interaction.prompt as string}
        </p>
        <div className={styles.actions}>
          {items.map((item) => {
            const selected = checklist.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={`${styles.checkItem} ${selected ? styles.checkItemSelected : ""}`}
                onClick={() => onChecklistToggle(item)}
              >
                <span className={`${styles.checkbox} ${selected ? styles.checkboxOn : ""}`}>
                  {selected ? "✓" : ""}
                </span>
                {item}
              </button>
            );
          })}
        </div>
        {done && (
          <div style={{ marginTop: "1rem" }}>
            <Button size="xl" fullWidth onClick={onAdvance}>
              Continue →
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (type === "completion") {
    return (
      <div className={styles.actions}>
        <Button size="xl" fullWidth onClick={onAdvance}>
          {(interaction.cta as string) ?? "Finish"}
        </Button>
      </div>
    );
  }

  return null;
}
