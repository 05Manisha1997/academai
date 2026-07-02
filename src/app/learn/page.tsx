import Link from "next/link";
import { LEARN_TOPICS } from "@/lib/site-sections";
import styles from "./learn.module.css";

const FEATURED = LEARN_TOPICS.find((topic) => "featured" in topic && topic.featured) ?? LEARN_TOPICS[0];
const MORE_TOPICS = LEARN_TOPICS.filter((topic) => topic !== FEATURED);

export default function LearnPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.badge}>Learn</span>
        <h1 className={styles.title}>Build your AI knowledge</h1>
        <p className={styles.lead}>
          Not hype or jargon — thoughtful lessons that help you truly understand how AI works
          and what it means for everyday life.
        </p>
      </header>

      <article className={styles.feature}>
        <div>
          <h2 className={styles.featureTitle}>
            <span aria-hidden>{FEATURED.icon}</span> {FEATURED.title}
          </h2>
          <p className={styles.featureDesc}>{FEATURED.description}</p>
          <ul className={styles.list}>
            {FEATURED.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <Link href={FEATURED.href} className={styles.cta}>
          {"ctaLabel" in FEATURED ? `${FEATURED.ctaLabel} →` : "Start lesson →"}
        </Link>
      </article>

      {MORE_TOPICS.length > 0 && (
        <section className={styles.more} aria-label="More learn topics">
          <h2 className={styles.moreTitle}>More topics</h2>
          <div className={styles.grid}>
            {MORE_TOPICS.map((topic) => (
              <Link key={topic.label} href={topic.href} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.icon} aria-hidden>
                    {topic.icon}
                  </span>
                  <span className={styles.cardTitle}>{topic.label}</span>
                </div>
                <p className={styles.cardDesc}>{topic.description}</p>
                <span className={styles.cardCta}>Open topic →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className={styles.tip}>
        Each lesson opens with a short intro — then you start at your own pace. No AI inference,
        just learning content on your device.
      </p>
    </div>
  );
}
