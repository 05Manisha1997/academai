import Link from "next/link";
import styles from "./prevent.module.css";

export default function PreventPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.badge}>Prevent</span>
        <h1 className={styles.title}>Use AI safely</h1>
        <p className={styles.lead}>
          Practice prompting with guardrails, EU AI Act awareness, and live coaching — so you
          learn to prevent harm before it happens.
        </p>
      </header>

      <article className={styles.feature}>
        <div>
          <h2 className={styles.featureTitle}>Prompt Sandbox</h2>
          <p className={styles.featureDesc}>
            A guardrailed space to write prompts, see safety scans, and run Llama 2 locally with
            full transparency.
          </p>
          <ul className={styles.list}>
            <li>Live prompt grading as you type</li>
            <li>EU AI Act and safety pop-ups</li>
            <li>Simulated or Live · Llama 2 modes</li>
          </ul>
        </div>
        <Link href="/prevent/sandbox" className={styles.cta}>
          Open Prompt Sandbox →
        </Link>
      </article>
    </div>
  );
}
