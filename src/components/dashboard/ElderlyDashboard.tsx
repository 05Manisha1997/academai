"use client";

import Link from "next/link";
import { ReadAloudButton } from "@/components/elderly/ReadAloudButton";
import styles from "./elderly.module.css";

const SAFETY_TIPS = [
  "If someone asks for money urgently by phone or message, pause — scammers use AI voices too.",
  "Banks never ask for your full password by text.",
  "When in doubt, call a family member on a number you already know.",
];

const PAGE_INTRO =
  "Welcome to your safety dashboard. Here you will find clear tips against AI scams and short lessons to build confidence.";

export function ElderlyDashboard() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.readAloudRow}>
        <ReadAloudButton text={PAGE_INTRO} label="🔊 Read this page aloud" />
      </div>

      <section className={styles.safety} aria-labelledby="safety-heading">
        <h2 id="safety-heading">Safety First — AI Scam Alerts</h2>
        <ul>
          {SAFETY_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Start Learning</h2>
        <div className={styles.lessons}>
          <Link
            href="/dashboard/elderly/modules/spot-the-scam"
            className={styles.lessonCard}
          >
            🛡️ Spot the Scam — Practice safely
            <span className={styles.lessonMeta}>
              10 scenarios · Text, email & voicemail
            </span>
          </Link>
          <Link
            href="/dashboard/elderly/modules/super-smart-puppy-intro"
            className={styles.lessonCard}
          >
            🐕 Meet Your Super-Smart Puppy — How AI Learns
            <span className={styles.lessonMeta}>3 minutes · Voice-friendly</span>
          </Link>
          <Link
            href="/dashboard/elderly/modules/spot-the-deepfake"
            className={styles.lessonCard}
          >
            🔍 Spot the Deepfake — Protect Yourself
            <span className={styles.lessonMeta}>3 steps · See, Touch, Tweak</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
