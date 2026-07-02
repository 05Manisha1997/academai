"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LearningModule, LearningStep } from "@/types/learning-module";
import type { AudienceProfile } from "@/types/profiles";
import { useEngagement } from "@/components/shared/EngagementProvider";
import { useOptionalResourceMonitor } from "@/components/shared/ResourceMonitorProvider";
import { Button } from "@/components/ui/Button";
import { QuizStep } from "./interactions/QuizStep";
import { ClassifyStep } from "./interactions/ClassifyStep";
import { HabitListStep } from "./interactions/HabitListStep";
import styles from "./module-runner.module.css";

const MODALITY_LABELS = {
  see: "See it",
  touch: "Touch it",
  tweak: "Tweak it",
} as const;

interface ModuleRunnerProps {
  module: LearningModule;
  profile: AudienceProfile;
}

export function ModuleRunner({ module, profile }: ModuleRunnerProps) {
  const { track } = useEngagement();
  const resources = useOptionalResourceMonitor();
  const [stepIndex, setStepIndex] = useState(0);
  const [stepScores, setStepScores] = useState<Record<string, number>>({});
  const [stepComplete, setStepComplete] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(() => Date.now());

  const step = module.steps[stepIndex];
  const isLast = stepIndex === module.steps.length - 1;

  useEffect(() => {
    track("module_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per module mount
  }, []);

  useEffect(() => {
    if (!step) return;
    setStepComplete(false);
    setHintShown(false);
    track("step_viewed", { stepId: step.id });
  }, [step, track]);

  const handleStepScore = useCallback(
    (score: number) => {
      if (!step) return;
      setStepScores((prev) => ({ ...prev, [step.id]: score }));
      setStepComplete(true);
      track("answer_submitted", {
        stepId: step.id,
        payload: { score, correct: score >= (step.successCriteria?.minScore ?? 0.5) },
      });
      track("interaction_completed", {
        stepId: step.id,
        payload: { score },
      });
      resources?.recordLearningStep(`Lesson · ${step.title ?? step.id}`);
    },
    [step, track, resources]
  );

  const handleHabitComplete = useCallback(() => {
    if (!step) return;
    setStepScores((prev) => ({ ...prev, [step.id]: 1 }));
    setStepComplete(true);
    track("interaction_completed", { stepId: step.id, payload: { score: 1 } });
    resources?.recordLearningStep(`Lesson · ${step.title}`);
  }, [step, track, resources]);

  function showHint() {
    setHintShown(true);
    track("hint_requested", { stepId: step?.id, payload: { hintLevel: 1 } });
  }

  function goNext() {
    if (isLast) {
      const scores = Object.values(stepScores);
      const overall =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
      track("module_completed", {
        payload: {
          overallScore: overall,
          totalDurationMs: Date.now() - startTime,
        },
      });
      setFinished(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  if (finished) {
    const avg =
      Object.values(stepScores).reduce((a, b) => a + b, 0) /
      Math.max(Object.values(stepScores).length, 1);

    return (
      <div className={styles.runner}>
        <div className={styles.completion}>
          <div className={styles.completionEmoji}>
            {profile === "under-14" ? "🎉" : profile === "elderly" ? "⭐" : "✅"}
          </div>
          <h2 className={styles.completionTitle}>Module complete!</h2>
          <p className={styles.completionScore}>
            You scored {Math.round(avg * 100)}% — AI needs your judgment, and you proved it.
          </p>
          {profile === "under-14" && (
            <p style={{ marginBottom: "1rem", fontWeight: 700, color: "var(--aifa-accent)" }}>
              +50 XP earned!
            </p>
          )}
          <Link href={`/dashboard/${profile}`}>
            <Button size="large">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.runner}>
      <Link href={`/dashboard/${profile}`} className={styles.back}>
        ← Back
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{module.title}</h1>
        <p className={styles.description}>{module.description}</p>
      </header>

      <div className={styles.progress} aria-label="Module progress">
        {module.steps.map((s, i) => (
          <div key={s.id} className={styles.progressStep}>
            <div
              className={styles.progressFill}
              style={{
                width: i < stepIndex ? "100%" : i === stepIndex ? "50%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {step && (
        <StepContent
          step={step}
          stepComplete={stepComplete}
          hintShown={hintShown}
          onHint={showHint}
          onQuizComplete={handleStepScore}
          onClassifyComplete={handleStepScore}
          onHabitComplete={handleHabitComplete}
          onNext={goNext}
          isLast={isLast}
          profile={profile}
        />
      )}
    </div>
  );
}

interface StepContentProps {
  step: LearningStep;
  stepComplete: boolean;
  hintShown: boolean;
  onHint: () => void;
  onQuizComplete: (score: number) => void;
  onClassifyComplete: (score: number) => void;
  onHabitComplete: () => void;
  onNext: () => void;
  isLast: boolean;
  profile: AudienceProfile;
}

function StepContent({
  step,
  stepComplete,
  hintShown,
  onHint,
  onQuizComplete,
  onClassifyComplete,
  onHabitComplete,
  onNext,
  isLast,
  profile,
}: StepContentProps) {
  const config = step.content.interactionConfig ?? {};

  return (
    <article className={styles.stepCard}>
      <span className={styles.modalityBadge}>{MODALITY_LABELS[step.modality]}</span>
      <h2 className={styles.stepTitle}>{step.title}</h2>
      <p className={styles.headline}>{step.content.headline}</p>
      <p className={styles.body}>{step.content.body}</p>

      {step.content.interactionType === "quiz" && (
        <QuizStep
          question={(config.question as string) ?? "Choose one:"}
          options={(config.options as { id: string; label: string; correct: boolean }[]) ?? []}
          onComplete={onQuizComplete}
        />
      )}

      {step.content.interactionType === "drag-drop" && (
        <ClassifyStep
          items={(config.items as { id: string; label: string; isReal: boolean }[]) ?? []}
          onComplete={onClassifyComplete}
        />
      )}

      {step.content.interactionType === "slider" && (
        <HabitListStep
          habits={(config.habits as string[]) ?? []}
          onComplete={onHabitComplete}
        />
      )}

      {step.modality === "touch" && !hintShown && !stepComplete && profile !== "under-14" && (
        <button
          type="button"
          onClick={onHint}
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "var(--aifa-muted)",
            textDecoration: "underline",
          }}
        >
          Need a hint?
        </button>
      )}

      {hintShown && (
        <p className={styles.hint}>
          Tip: Look at the edges around hair and ears, and whether lip movements match the words.
        </p>
      )}

      <div className={styles.actions}>
        {stepComplete && (
          <Button size={profile === "elderly" ? "xl" : "large"} onClick={onNext}>
            {isLast ? "Finish module" : "Next step →"}
          </Button>
        )}
      </div>
    </article>
  );
}
