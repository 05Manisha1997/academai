"use client";

import Link from "next/link";
import styles from "./students.module.css";

const MODULES = [
  { slug: "spot-the-scam", title: "Spot the Scam", duration: "10 min", level: "Intro" },
  { slug: "spot-the-deepfake", title: "Spot the Deepfake", duration: "8 min", level: "Intro" },
];

export function StudentsDashboard() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.grid}>
        <section className={styles.panel}>
          <h2>Resources</h2>
          <ul className={styles.linkList}>
            <li>
              <Link href="/dashboard/students-lecturers/playground">
                🧪 Cadet Sandbox (prompt coach)
              </Link>
            </li>
            <li>
              <Link href="#">📋 Citation Checker (coming soon)</Link>
            </li>
            <li>
              <Link href="#">🎓 Classroom Integration Guide</Link>
            </li>
          </ul>
          <div className={styles.tip}>
            <strong>Workflow tip:</strong> Use AI to draft, then verify. Never submit unchecked AI output as fact.
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Learning Modules</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Module</th>
                <th>Duration</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.slug}>
                  <td>
                    <Link href={`/dashboard/students-lecturers/modules/${m.slug}`}>
                      {m.title}
                    </Link>
                  </td>
                  <td>{m.duration}</td>
                  <td>
                    <span className={styles.badge}>{m.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
