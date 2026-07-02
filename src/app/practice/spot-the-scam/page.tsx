import { EngagementProvider } from "@/components/shared/EngagementProvider";
import { SpotTheScamRunner } from "@/components/learning/spot-the-scam/SpotTheScamRunner";
import styles from "../practice.module.css";

export default function PracticeScamPage() {
  return (
    <div data-module="spot-the-scam" className="scam-theme">
      <div className={styles.page}>
        <EngagementProvider moduleId="spot-the-scam">
          <SpotTheScamRunner profile="students-lecturers" backHref="/practice" backLabel="← Back to Practice" />
        </EngagementProvider>
      </div>
    </div>
  );
}
