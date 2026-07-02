import Link from "next/link";
import styles from "./practice.module.css";

export default function PracticePage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.badge}>Practice</span>
        <h1 className={styles.title}>Train your judgment</h1>
        <p className={styles.lead}>
          Real-world scenarios with instant feedback. Learn to spot scams, pressure tactics,
          and things that feel wrong.
        </p>
      </header>

      <article className={styles.feature}>
        <div>
          <h2 className={styles.featureTitle}>Spot the Scam</h2>
          <p className={styles.featureDesc}>
            Work through messages, calls, and links. Decide what&apos;s safe — and see why.
          </p>
          <ul className={styles.list}>
            <li>Bank impersonation and urgency tricks</li>
            <li>Phishing links and fake support</li>
            <li>Confidence-building feedback after each choice</li>
          </ul>
        </div>
        <Link href="/practice/spot-the-scam" className={styles.cta}>
          Start Spot the Scam →
        </Link>
      </article>
    </div>
  );
}
