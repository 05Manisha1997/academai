import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

export default function PreventLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell active="prevent" section="prevent">
      {children}
    </SiteShell>
  );
}
