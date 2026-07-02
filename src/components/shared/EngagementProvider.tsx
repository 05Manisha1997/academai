"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { EngagementEvent, EngagementEventType } from "@/types/learning-module";

interface EngagementContextValue {
  sessionId: string;
  track: (eventType: EngagementEventType, extra?: Partial<EngagementEvent>) => void;
  events: EngagementEvent[];
}

const EngagementContext = createContext<EngagementContextValue | null>(null);

function generateSessionId() {
  return `sess-${crypto.randomUUID()}`;
}

interface EngagementProviderProps {
  moduleId: string;
  children: React.ReactNode;
}

export function EngagementProvider({ moduleId, children }: EngagementProviderProps) {
  const sessionId = useMemo(() => generateSessionId(), []);
  const eventsRef = useRef<EngagementEvent[]>([]);

  const track = useCallback(
    (eventType: EngagementEventType, extra?: Partial<EngagementEvent>) => {
      const event: EngagementEvent = {
        eventType,
        timestamp: new Date().toISOString(),
        ...extra,
      };
      eventsRef.current.push(event);

      if (typeof window !== "undefined" && eventsRef.current.length % 3 === 0) {
        void fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            moduleId,
            events: eventsRef.current.slice(-3),
          }),
        }).catch(() => {});
      }
    },
    [sessionId, moduleId]
  );

  const value = useMemo(
    () => ({
      sessionId,
      track,
      events: eventsRef.current,
    }),
    [sessionId, track]
  );

  return (
    <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>
  );
}

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx) {
    throw new Error("useEngagement must be used within EngagementProvider");
  }
  return ctx;
}
