"use client";

import { useCallback, useRef } from "react";
import type { EngagementEvent, EngagementEventType } from "@/types/learning-module";

interface EngagementTrackerProps {
  sessionId: string;
  moduleId: string;
  onEvent?: (event: EngagementEvent) => void;
  children: React.ReactNode;
}

/**
 * Wraps module UI and batches engagement events for the adaptive ML engine.
 * Events POST to /api/sessions (to be implemented).
 */
export function EngagementTracker({
  sessionId,
  moduleId,
  onEvent,
  children,
}: EngagementTrackerProps) {
  const bufferRef = useRef<EngagementEvent[]>([]);

  const track = useCallback(
    (eventType: EngagementEventType, extra?: Partial<EngagementEvent>) => {
      const event: EngagementEvent = {
        eventType,
        timestamp: new Date().toISOString(),
        ...extra,
      };
      bufferRef.current.push(event);
      onEvent?.(event);

      if (bufferRef.current.length >= 5) {
        flushEvents(sessionId, moduleId, bufferRef.current);
        bufferRef.current = [];
      }
    },
    [sessionId, moduleId, onEvent]
  );

  return (
    <div data-session={sessionId} data-tracker="engagement">
      {children}
    </div>
  );
}

async function flushEvents(
  sessionId: string,
  moduleId: string,
  events: EngagementEvent[]
) {
  try {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, moduleId, events }),
    });
  } catch {
    // Offline buffer retry can be added later
  }
}
