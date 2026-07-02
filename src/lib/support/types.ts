import type { AudienceProfile } from "@/types/profiles";

export type SupportMessageRole = "user" | "bot" | "human" | "system";

export type SupportMode = "bot" | "human" | "ended";

export interface SupportMessage {
  id: string;
  role: SupportMessageRole;
  text: string;
  at: string;
}

export interface SupportSession {
  id: string;
  createdAt: string;
  mode: SupportMode;
  escalated: boolean;
  profile: AudienceProfile;
  messages: SupportMessage[];
  /** Flagged for training export when session ends. */
  loggedForTraining: true;
}

export interface SupportStartResponse {
  sessionId: string;
  messages: SupportMessage[];
}

export interface SupportMessageResponse {
  sessionId: string;
  messages: SupportMessage[];
  mode: SupportMode;
  escalated: boolean;
}

export const SUPPORT_DISCLAIMER =
  "Only support chat logs will be saved for future training purposes. Once you leave this chat, you will no longer have access to this conversation.";
