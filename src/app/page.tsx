import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LEARN_TOPICS } from "@/lib/site-sections";
import styles from "./home.module.css";

const FEATURED_LEARN =
  LEARN_TOPICS.find((topic) => "featured" in topic && topic.featured) ?? LEARN_TOPICS[0];

export default function HomePage() {
  return (
    <div className={styles.landing} data-section="home">
      <SiteHeader active="home" />

      <main className={styles.hero}>
        <div className={styles.heroBrand}>
          <Image
            src="/brand/academai-logo.png"
            alt="academAI"
            width={420}
            height={130}
            className={styles.heroLogo}
            priority
          />
          <p className={styles.tagline}>Become AI smart</p>
        </div>

        <p className={styles.intro}>
          Friendly lessons, hands-on practice, and guardrailed AI — for learners of every age.
        </p>

        <section className={styles.pillars} aria-label="Learn Practice Prevent">
          <article className={`${styles.pillar} ${styles.learn}`}>
            <span className={styles.pillarBadge}>01</span>
            <h2 className={styles.pillarTitle}>Learn</h2>
            <p className={styles.pillarDesc}>
              Gain real knowledge about AI — ideas that stick, in language anyone can follow.
            </p>
            <Link href={FEATURED_LEARN.href} className={styles.primaryCta}>
              {"ctaLabel" in FEATURED_LEARN ? FEATURED_LEARN.ctaLabel : FEATURED_LEARN.label} →
            </Link>
            <Link href="/learn" className={styles.secondaryCta}>
              All learn topics
            </Link>
          </article>

          <article className={`${styles.pillar} ${styles.practice}`}>
            <span className={styles.pillarBadge}>02</span>
            <h2 className={styles.pillarTitle}>Practice</h2>
            <p className={styles.pillarDesc}>
              Test your judgment with guided scenarios and instant feedback.
            </p>
            <Link href="/practice/spot-the-scam" className={styles.primaryCta}>
              Spot the Scam →
            </Link>
            <Link href="/practice" className={styles.secondaryCta}>
              All practice activities
            </Link>
          </article>

          <article className={`${styles.pillar} ${styles.prevent}`}>
            <span className={styles.pillarBadge}>03</span>
            <h2 className={styles.pillarTitle}>Prevent</h2>
            <p className={styles.pillarDesc}>
              Prompt safely with guardrails, coaching, and local Llama 2 in Prompt Sandbox.
            </p>
            <Link href="/prevent/sandbox" className={styles.primaryCta}>
              Prompt Sandbox →
            </Link>
            <Link href="/prevent" className={styles.secondaryCta}>
              About Prevent
            </Link>
          </article>
        </section>

        <div className={styles.audiences}>
          <p className={styles.audiencesLabel}>Choose your path</p>
          <div className={styles.audienceLinks}>
            <Link href="/dashboard/under-14" className={styles.audienceChip}>
              Under 14
            </Link>
            <Link href="/dashboard/students-lecturers" className={styles.audienceChip}>
              Students &amp; Lecturers
            </Link>
            <Link href="/dashboard/elderly" className={styles.audienceChip}>
              Elderly
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
