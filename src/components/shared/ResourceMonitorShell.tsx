"use client";

import type { ReactNode } from "react";
import { ResourceMonitor } from "./ResourceMonitor";
import { ResourceMonitorProvider } from "./ResourceMonitorProvider";

interface ResourceMonitorShellProps {
  children: ReactNode;
  section?: "learn" | "practice" | "prevent" | "home" | "dashboard";
}

/** Wraps pages that should show the corner resource monitor during prompting / learning. */
export function ResourceMonitorShell({
  children,
  section = "home",
}: ResourceMonitorShellProps) {
  return (
    <ResourceMonitorProvider>
      {children}
      <ResourceMonitor section={section} />
    </ResourceMonitorProvider>
  );
}
