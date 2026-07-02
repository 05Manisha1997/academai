import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell active="home" section="home">
      {children}
    </SiteShell>
  );
}
