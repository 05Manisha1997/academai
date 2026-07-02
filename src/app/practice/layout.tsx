import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

export default function PracticeLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell active="practice" section="practice">
      {children}
    </SiteShell>
  );
}
