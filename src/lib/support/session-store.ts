import type { AudienceProfile } from "@/types/profiles";
import type { SupportMessage, SupportSession } from "./types";

const sessions = new Map<string, SupportSession>();

function msgId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSession(profile: AudienceProfile): SupportSession {
  const id = `sup-${crypto.randomUUID()}`;
  const welcome: SupportMessage = {
    id: msgId(),
    role: "bot",
    text:
      "Hi! I'm the academAI support bot. Ask about learning modules, AI safety, or how to use the platform.\n\nIf your question is unclear or needs a personal touch, a human advisor can step in.",
    at: new Date().toISOString(),
  };

  const session: SupportSession = {
    id,
    createdAt: new Date().toISOString(),
    mode: "bot",
    escalated: false,
    profile,
    messages: [welcome],
    loggedForTraining: true,
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): SupportSession | null {
  const session = sessions.get(id);
  if (!session || session.mode === "ended") return null;
  return session;
}

export function appendMessage(sessionId: string, message: Omit<SupportMessage, "id" | "at">): SupportMessage | null {
  const session = getSession(sessionId);
  if (!session) return null;

  const entry: SupportMessage = {
    ...message,
    id: msgId(),
    at: new Date().toISOString(),
  };
  session.messages.push(entry);
  return entry;
}

export function escalateSession(sessionId: string): SupportSession | null {
  const session = getSession(sessionId);
  if (!session) return null;
  session.mode = "human";
  session.escalated = true;
  return session;
}

export function endSession(sessionId: string): SupportSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.mode = "ended";
  return session;
}

export function peekSession(id: string): SupportSession | null {
  return sessions.get(id) ?? null;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}
