import type { ReactNode } from "react";
import { ResourceMonitorShell } from "@/components/shared/ResourceMonitorShell";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader, type SiteSection } from "./SiteHeader";
import styles from "./site-shell.module.css";

interface SiteShellProps {
  children: ReactNode;
  active: SiteSection;
  section?: "learn" | "practice" | "prevent" | "home";
}

export function SiteShell({ children, active, section = "home" }: SiteShellProps) {
  return (
    <ResourceMonitorShell section={section}>
      <div className={styles.shell} data-section={section}>
        <SiteHeader active={active} />
        <main className={styles.main}>{children}</main>
        <SiteFooter />
      </div>
    </ResourceMonitorShell>
  );
}
