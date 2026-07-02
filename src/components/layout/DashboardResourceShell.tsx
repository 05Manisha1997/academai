"use client";

import type { ReactNode } from "react";
import { ResourceMonitorShell } from "@/components/shared/ResourceMonitorShell";

export function DashboardResourceShell({ children }: { children: ReactNode }) {
  return <ResourceMonitorShell section="dashboard">{children}</ResourceMonitorShell>;
}
