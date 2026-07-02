import { NextResponse } from "next/server";
import {
  escalationNotice,
  generateBotReply,
  generateHumanReply,
} from "@/lib/support/human-advisor";
import {
  appendMessage,
  createSession,
  deleteSession,
  endSession,
  escalateSession,
  getSession,
  peekSession,
} from "@/lib/support/session-store";
import { assessQuestion } from "@/lib/support/triage";
import type { SupportSession } from "@/lib/support/types";
import type { AudienceProfile } from "@/types/profiles";

const PROFILES: AudienceProfile[] = ["under-14", "students-lecturers", "elderly"];

function logForTraining(session: SupportSession): void {
  const payload = {
    type: "support_training_log",
    sessionId: session.id,
    profile: session.profile,
    escalated: session.escalated,
    messageCount: session.messages.length,
    startedAt: session.createdAt,
    endedAt: new Date().toISOString(),
    messages: session.messages.map((m) => ({
      role: m.role,
      text: m.text,
      at: m.at,
    })),
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[support-training]", JSON.stringify(payload).slice(0, 500));
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found or ended" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.id,
    mode: session.mode,
    escalated: session.escalated,
    messages: session.messages,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = body.action as string;
  const profile = PROFILES.includes(body.profile) ? body.profile : "students-lecturers";

  if (action === "start") {
    const session = createSession(profile);
    return NextResponse.json({
      sessionId: session.id,
      mode: session.mode,
      messages: session.messages,
    });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found or ended" }, { status: 404 });
  }

  if (action === "end") {
    const active = getSession(sessionId);
    if (!active) {
      return NextResponse.json({ error: "Session not found or ended" }, { status: 404 });
    }
    logForTraining(active);
    endSession(sessionId);
    deleteSession(sessionId);
    return NextResponse.json({ ok: true, ended: true });
  }

  if (action === "message") {
    const text = typeof body.message === "string" ? body.message.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    appendMessage(sessionId, { role: "user", text });

    const triage = assessQuestion(text);
    const replies = [];

    if (session.mode === "bot" && (triage.vague || triage.wantsHuman)) {
      const notice = appendMessage(sessionId, { role: "system", text: escalationNotice() });
      if (notice) replies.push(notice);
      escalateSession(sessionId);

      const humanText = await generateHumanReply(
        text,
        session.profile,
        session.messages.map((m) => `${m.role}: ${m.text}`)
      );
      const humanMsg = appendMessage(sessionId, { role: "human", text: humanText });
      if (humanMsg) replies.push(humanMsg);
    } else if (session.mode === "human" || getSession(sessionId)?.mode === "human") {
      const humanText = await generateHumanReply(
        text,
        session.profile,
        session.messages.map((m) => `${m.role}: ${m.text}`)
      );
      const humanMsg = appendMessage(sessionId, { role: "human", text: humanText });
      if (humanMsg) replies.push(humanMsg);
    } else {
      const botText = await generateBotReply(text, session.profile);
      const botMsg = appendMessage(sessionId, { role: "bot", text: botText });
      if (botMsg) replies.push(botMsg);
    }

    const updated = getSession(sessionId);
    return NextResponse.json({
      sessionId,
      mode: updated?.mode ?? "bot",
      escalated: updated?.escalated ?? false,
      messages: replies,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = peekSession(sessionId);
  if (session) {
    logForTraining(session);
    deleteSession(sessionId);
  }

  return NextResponse.json({ ok: true, ended: true });
}
