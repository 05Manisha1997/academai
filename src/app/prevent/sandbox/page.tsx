import { PromptSandbox } from "@/components/students/PromptSandbox";
import styles from "../prevent.module.css";

export default function PreventSandboxPage() {
  return (
    <div data-profile="students-lecturers">
      <div className={styles.sandboxWrap}>
        <PromptSandbox />
      </div>
    </div>
  );
}
