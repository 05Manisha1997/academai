import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell active="learn" section="learn">
      {children}
    </SiteShell>
  );
}
