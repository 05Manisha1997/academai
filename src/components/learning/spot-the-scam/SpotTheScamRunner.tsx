"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AudienceProfile } from "@/types/profiles";
import {
  getScamBank,
  shuffleIndices,
  type ScamScenario,
} from "@/lib/spot-the-scam";
import { useEngagement } from "@/components/shared/EngagementProvider";
import styles from "./spot-the-scam.module.css";

const CHANNEL_ICON: Record<string, string> = {
  "Text message": "💬",
  Email: "✉️",
  Voicemail: "📞",
};

interface SpotTheScamRunnerProps {
  profile: AudienceProfile;
}

export function SpotTheScamRunner({ profile }: SpotTheScamRunnerProps) {
  const bank = useMemo(() => getScamBank(), []);
  const { track } = useEngagement();

  const [screen, setScreen] = useState<"welcome" | "play" | "done">("welcome");
  const [order, setOrder] = useState<number[]>(() =>
    shuffleIndices(bank.scenarios.length)
  );
  const [pos, setPos] = useState(0);
  const [guess, setGuess] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const current: ScamScenario | null =
    screen === "play" ? bank.scenarios[order[pos]] : null;

  useEffect(() => {
    track("module_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    setScreen("play");
    setOrder(shuffleIndices(bank.scenarios.length));
    setPos(0);
    setGuess(null);
    setScore({ correct: 0, total: 0 });
    track("step_viewed", { stepId: "scam-welcome" });
  }, [bank.scenarios.length, track]);

  const nextMessage = useCallback(() => {
    setGuess(null);
    setPos((p) => {
      const next = p + 1;
      if (next >= bank.scenarios.length) {
        setScreen("done");
        track("module_completed", {
          payload: { correct: score.correct, total: score.total },
        });
        return p;
      }
      track("step_viewed", { stepId: `scam-round-${next}` });
      return next;
    });
  }, [bank.scenarios.length, score, track]);

  const answer = useCallback(
    (saidScam: boolean) => {
      if (!current || guess !== null) return;
      setGuess(saidScam);
      const correct = saidScam === current.isScam;
      setScore((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
      }));
      track("answer_submitted", {
        stepId: current.id,
        payload: { saidScam, correct, isScam: current.isScam },
      });
    },
    [current, guess, track]
  );

  if (screen === "done") {
    return (
      <div className={styles.runner}>
        <div className={styles.welcome}>
          <div className={styles.bigLogo}>🛡️</div>
          <h1 className={styles.welcomeTitle}>Practice complete!</h1>
          <p className={styles.lead}>
            You spotted {score.correct} of {score.total} correctly. Real scams use
            pressure — you&apos;re building the habit of pausing first.
          </p>
          <button type="button" className={styles.btnPrimary} onClick={start}>
            Practice again →
          </button>
          <Link href={`/dashboard/${profile}`} className={styles.back} style={{ marginTop: "1.5rem" }}>
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (screen === "welcome") {
    return (
      <div className={styles.runner}>
        <Link href={`/dashboard/${profile}`} className={styles.back}>
          ← Back
        </Link>
        <div className={styles.welcome}>
          <div className={styles.bigLogo}>🛡️</div>
          <h1 className={styles.welcomeTitle}>{bank.title}</h1>
          <p className={styles.lead}>
            Scam messages are everywhere. Practice telling the real ones from the
            fakes — calmly, and with nothing to lose.
          </p>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <p>Read a message, just like one you might really get.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <p>Decide: does it look safe, or like a scam?</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <p>See the answer and learn the warning signs.</p>
            </div>
          </div>
          <button type="button" className={styles.btnPrimary} onClick={start}>
            Start practicing →
          </button>
          <p className={styles.footer}>
            Every example is made up. You can&apos;t lose any money here.
          </p>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const answered = guess !== null;
  const correct = guess === current.isScam;

  return (
    <div className={styles.runner}>
      <Link href={`/dashboard/${profile}`} className={styles.back}>
        ← Back
      </Link>

      <div className={styles.actHead}>
        <div className={styles.actId}>
          <div className={styles.actLogo}>🛡️</div>
          <div>
            <h1>{bank.title}</h1>
            <p>A safe place to practice</p>
          </div>
        </div>
        {score.total > 0 && (
          <div className={styles.score}>
            <div className={styles.scoreLab}>Spotted</div>
            <div className={styles.scoreVal}>
              {score.correct} <span style={{ color: "var(--scam-faint)" }}>of</span>{" "}
              {score.total}
            </div>
          </div>
        )}
      </div>

      <div className={styles.msg}>
        <div className={styles.msgChan}>
          {CHANNEL_ICON[current.channel]} {current.channel}
        </div>
        <div className={styles.msgBody}>
          <div className={styles.from}>
            From: <strong>{current.sender}</strong>
          </div>
          {current.subject && <div className={styles.subj}>{current.subject}</div>}
          <p className={styles.msgText}>{current.body}</p>
        </div>
      </div>

      {!answered ? (
        <div className={styles.choices}>
          <button
            type="button"
            className={`${styles.choice} ${styles.choiceSafe}`}
            onClick={() => answer(false)}
          >
            🛡️ Looks safe
          </button>
          <button
            type="button"
            className={`${styles.choice} ${styles.choiceScam}`}
            onClick={() => answer(true)}
          >
            ⚠️ Looks like a scam
          </button>
        </div>
      ) : (
        <>
          <div
            className={`${styles.verdict} ${correct ? styles.verdictRight : styles.verdictWrong}`}
          >
            <div className={styles.badge}>{correct ? "✓" : "↻"}</div>
            <div>
              <h2>{correct ? "Well spotted!" : "Good try — let's look closer"}</h2>
              <p>This message was {current.isScam ? "a scam" : "legitimate"}.</p>
            </div>
          </div>

          <div
            className={`${styles.signs} ${current.isScam ? styles.signsScam : styles.signsLegit}`}
          >
            <h3>
              {current.isScam ? "⚠️ Warning signs" : "🛡️ Why this one is safe"}
            </h3>
            <ul>
              {(current.isScam ? current.redFlags : current.safeSigns).map((item) => (
                <li key={item}>
                  <span className={styles.dot} />
                  {item}
                </li>
              ))}
            </ul>
            <p className={styles.explain}>{current.explanation}</p>
            {current.lesson && (
              <div className={styles.lesson}>
                <span>✨</span>
                <p>{current.lesson}</p>
              </div>
            )}
          </div>

          <button type="button" className={styles.btnPrimary} onClick={nextMessage}>
            Next message →
          </button>
        </>
      )}

      <p className={styles.footer}>Every example here is made up for practice.</p>
    </div>
  );
}
