import Link from "next/link";
import { LEARN_TOPICS } from "@/lib/site-sections";
import styles from "./learn.module.css";

export default function LearnPage() {
  return (
    <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.badge}>Learn</span>
          <h1 className={styles.title}>Build your AI understanding</h1>
          <p className={styles.lead}>
            Short, friendly lessons in plain language. No jargon — just clear concepts you can
            use every day.
          </p>
        </header>

        <div className={styles.grid}>
          {LEARN_TOPICS.map((topic) => (
            <Link key={topic.label} href={topic.href} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.icon} aria-hidden>
                  {topic.icon}
                </span>
                <span className={styles.cardTitle}>{topic.label}</span>
              </div>
              <p className={styles.cardDesc}>{topic.description}</p>
              <span className={styles.cardCta}>Start lesson →</span>
            </Link>
          ))}
        </div>

        <p className={styles.tip}>
          Tip: read at your own pace. Each lesson uses large, readable text and simple examples —
          designed to feel welcoming, not overwhelming.
        </p>
    </div>
  );
}
