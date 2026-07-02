import Link from "next/link";
import { CadetSandbox } from "@/components/students/CadetSandbox";
import styles from "../prevent.module.css";

export default function PreventSandboxPage() {
  return (
    <div data-profile="students-lecturers">
      <div className={styles.page}>
        <Link href="/prevent" className={styles.backLink}>
          ← Back to Prevent
        </Link>
      </div>
      <div className={styles.sandboxWrap}>
        <CadetSandbox />
      </div>
    </div>
  );
}
