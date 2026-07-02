"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applySnapshot,
  buildResourceSnapshot,
  emptySession,
  type ResourceSession,
  type ResourceSnapshot,
} from "@/lib/resource-footprint";
import type { OrchestratorBackend } from "@/lib/orchestrator/types";

interface OrchestratePayload {
  status?: string;
  text?: string;
  meta?: {
    backend?: OrchestratorBackend;
    model?: string;
    resources?: ResourceSnapshot;
  };
}

interface ResourceMonitorContextValue {
  session: ResourceSession;
  record: (snap: ResourceSnapshot) => void;
  recordFromOrchestrate: (data: OrchestratePayload) => void;
  recordLearningStep: (label?: string) => void;
  recordSimulatedPrompt: (params: {
    prompt: string;
    completion: string;
    latencyMs?: number;
  }) => void;
  reset: () => void;
}

const ResourceMonitorContext = createContext<ResourceMonitorContextValue | null>(null);

export function ResourceMonitorProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ResourceSession>(emptySession);

  const record = useCallback((snap: ResourceSnapshot) => {
    setSession((prev) => applySnapshot(prev, snap));
  }, []);

  const recordFromOrchestrate = useCallback(
    (data: OrchestratePayload) => {
      if (data.meta?.resources) {
        record(data.meta.resources);
        return;
      }

      const blocked = data.status === "blocked";
      record(
        buildResourceSnapshot({
          activity: "prompt",
          backend: data.meta?.backend ?? "simulated",
          model: data.meta?.model,
          blocked,
          promptText: "",
          completionText: blocked ? "" : data.text,
        })
      );
    },
    [record]
  );

  const recordLearningStep = useCallback(
    (label?: string) => {
      record(
        buildResourceSnapshot({
          activity: "learning",
          backend: "none",
          blocked: false,
          promptTokens: 0,
          completionTokens: 0,
          latencyMs: 0,
          label: label ?? "Lesson · no model call",
        })
      );
    },
    [record]
  );

  const recordSimulatedPrompt = useCallback(
    (params: { prompt: string; completion: string; latencyMs?: number }) => {
      record(
        buildResourceSnapshot({
          activity: "prompt",
          backend: "simulated",
          blocked: false,
          promptText: params.prompt,
          completionText: params.completion,
          latencyMs: params.latencyMs ?? 750,
        })
      );
    },
    [record]
  );

  const reset = useCallback(() => {
    setSession(emptySession());
  }, []);

  const value = useMemo(
    () => ({
      session,
      record,
      recordFromOrchestrate,
      recordLearningStep,
      recordSimulatedPrompt,
      reset,
    }),
    [session, record, recordFromOrchestrate, recordLearningStep, recordSimulatedPrompt, reset]
  );

  return (
    <ResourceMonitorContext.Provider value={value}>{children}</ResourceMonitorContext.Provider>
  );
}

export function useResourceMonitor(): ResourceMonitorContextValue {
  const ctx = useContext(ResourceMonitorContext);
  if (!ctx) {
    throw new Error("useResourceMonitor must be used within ResourceMonitorProvider");
  }
  return ctx;
}

export function useOptionalResourceMonitor(): ResourceMonitorContextValue | null {
  return useContext(ResourceMonitorContext);
}
