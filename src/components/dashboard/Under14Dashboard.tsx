"use client";

import Link from "next/link";
import styles from "./under14.module.css";

const GAMIFIED_MODULES = [
  { slug: "spot-the-scam", title: "Spot the Scam", xp: 60, icon: "🛡️" },
  { slug: "spot-the-deepfake", title: "Spot the Deepfake", xp: 50, icon: "🔍" },
  { slug: "super-smart-puppy-intro", title: "Train Your AI Puppy", xp: 40, icon: "🐕" },
];

export function Under14Dashboard() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.stats}>
        <span className={styles.stat}>⭐ Level 3</span>
        <span className={styles.stat}>🔥 5-day streak</span>
        <span className={styles.stat}>🏆 120 XP</span>
      </div>

      <h2 className={styles.sectionTitle}>Your Adventures</h2>
      <div className={styles.grid}>
        {GAMIFIED_MODULES.map((mod) => (
          <Link
            key={mod.slug}
            href={`/dashboard/under-14/modules/${mod.slug}`}
            className={styles.card}
          >
            <span className={styles.icon} aria-hidden>
              {mod.icon}
            </span>
            <span className={styles.cardTitle}>{mod.title}</span>
            <span className={styles.xp}>+{mod.xp} XP</span>
          </Link>
        ))}
      </div>

      <section className={styles.sandbox}>
        <h3>🧪 Quick Sandbox</h3>
        <p>Tap pictures. Label them real or fake. No reading required!</p>
        <Link
          href="/dashboard/under-14/modules/spot-the-deepfake"
          style={{
            display: "inline-block",
            marginTop: "0.75rem",
            fontWeight: 700,
            color: "#7c3aed",
          }}
        >
          Try Spot the Deepfake →
        </Link>
      </section>
    </main>
  );
}
