import Link from "next/link";
import { EngagementProvider } from "@/components/shared/EngagementProvider";
import { SpotTheScamRunner } from "@/components/learning/spot-the-scam/SpotTheScamRunner";
import styles from "../practice.module.css";

export default function PracticeScamPage() {
  return (
    <div data-module="spot-the-scam" className="scam-theme">
      <div className={styles.page}>
        <Link href="/practice" className={styles.backLink}>
          ← Back to Practice
        </Link>
        <EngagementProvider moduleId="spot-the-scam">
          <SpotTheScamRunner profile="students-lecturers" />
        </EngagementProvider>
      </div>
    </div>
  );
}
