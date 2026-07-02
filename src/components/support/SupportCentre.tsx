"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SupportMessage, SupportMode } from "@/lib/support/types";
import { SUPPORT_DISCLAIMER } from "@/lib/support/types";
import styles from "./support-centre.module.css";

const SESSION_KEY = "academai_support_session";

interface SupportCentreProps {
  profile?: "under-14" | "students-lecturers" | "elderly";
}

export function SupportCentre({ profile = "students-lecturers" }: SupportCentreProps) {
  const [accepted, setAccepted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [mode, setMode] = useState<SupportMode>("bot");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const scrollToBottom = useCallback(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const endSession = useCallback(async (id: string | null) => {
    if (!id) return;
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", sessionId: id }),
      });
    } catch {
      // best effort
    }
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  useEffect(() => {
    const onLeave = () => {
      const id = sessionIdRef.current;
      if (!id) return;
      fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", sessionId: id }),
        keepalive: true,
      }).catch(() => undefined);
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
    };
  }, []);

  const startSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start session");

      setSessionId(data.sessionId);
      sessionStorage.setItem(SESSION_KEY, data.sessionId);
      setMessages(data.messages ?? []);
      setMode(data.mode ?? "bot");
      setAccepted(true);
      setEnded(false);
    } catch {
      setAccepted(false);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;

    fetch(`/api/support?sessionId=${encodeURIComponent(stored)}`)
      .then((res) => {
        if (!res.ok) {
          sessionStorage.removeItem(SESSION_KEY);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setSessionId(data.sessionId);
        setMessages(data.messages ?? []);
        setMode(data.mode ?? "bot");
        setAccepted(true);
      })
      .catch(() => sessionStorage.removeItem(SESSION_KEY));
  }, []);

  const handleLeave = useCallback(async () => {
    await endSession(sessionId);
    setSessionId(null);
    sessionIdRef.current = null;
    setMessages([]);
    setEnded(true);
    setAccepted(false);
    setInput("");
    setMode("bot");
  }, [endSession, sessionId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !sessionId || loading || ended) return;

    setInput("");
    setLoading(true);

    const optimistic: SupportMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      text,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message", sessionId, message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "system",
            text: data.error ?? "Session ended. Please start a new chat.",
            at: new Date().toISOString(),
          },
        ]);
        if (res.status === 404) {
          setEnded(true);
          sessionStorage.removeItem(SESSION_KEY);
        }
        return;
      }

      setMode(data.mode ?? "bot");
      if (data.messages?.length) {
        setMessages((prev) => [...prev, ...data.messages]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          text: "Could not send message. Check your connection and try again.",
          at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [ended, input, loading, sessionId]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  const statusClass =
    mode === "human" ? styles.statusHuman : mode === "ended" ? styles.statusEnded : styles.statusBot;
  const statusLabel =
    mode === "human" ? "Human advisor" : mode === "ended" ? "Chat ended" : "Support bot";

  return (
    <div className={styles.support}>
      <div className={styles.header}>
        <h1 className={styles.title}>Support centre</h1>
        <p className={styles.subtitle}>
          Human in the loop — the chatbot handles clear questions; a human advisor steps in when
          things are vague or personal.
        </p>
      </div>

      <div className={styles.panel}>
        <div className={styles.statusBar}>
          <span className={`${styles.statusPill} ${statusClass}`}>
            {mode === "human" ? "👤" : mode === "ended" ? "·" : "🤖"} {statusLabel}
          </span>
          {accepted && !ended && (
            <button type="button" className={styles.leaveBtn} onClick={() => void handleLeave()}>
              Leave chat
            </button>
          )}
        </div>

        {ended ? (
          <div className={styles.ended}>
            <p className={styles.endedTitle}>This conversation has ended</p>
            <p>
              You no longer have access to this chat. Only anonymised logs were kept for training
              purposes.
            </p>
            <button type="button" className={styles.restartBtn} onClick={() => {
              setEnded(false);
              void startSession();
            }}>
              Start new chat
            </button>
          </div>
        ) : !accepted ? (
          <div className={styles.ended}>
            <p>Accept the disclaimer to begin.</p>
          </div>
        ) : (
          <>
            <div className={styles.transcript} ref={transcriptRef} aria-live="polite">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.bubble} ${
                    m.role === "user"
                      ? styles.user
                      : m.role === "human"
                        ? styles.human
                        : m.role === "system"
                          ? styles.system
                          : styles.bot
                  }`}
                >
                  {m.role !== "user" && (
                    <span className={styles.roleLabel}>
                      {m.role === "human"
                        ? "Human advisor"
                        : m.role === "system"
                          ? "Notice"
                          : "Support bot"}
                    </span>
                  )}
                  {m.text}
                </div>
              ))}
              {loading && <div className={styles.typing}>Typing…</div>}
            </div>

            <div className={styles.composer}>
              <div className={styles.composerRow}>
                <textarea
                  className={styles.textarea}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask a question…"
                  aria-label="Support message"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || loading}
                >
                  Send
                </button>
              </div>
              <p className={styles.disclaimerBar}>{SUPPORT_DISCLAIMER}</p>
            </div>
          </>
        )}
      </div>

      {!accepted && !ended && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="support-disclaimer-title">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 id="support-disclaimer-title" className={styles.modalTitle}>
                Before you chat
              </h2>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDisclaimer}>
                <strong>Disclaimer:</strong> {SUPPORT_DISCLAIMER}
              </p>
              <p>
                A bot will try to answer first. If your question is vague or needs a human touch, an
                advisor will join the conversation.
              </p>
            </div>
            <div className={styles.modalActions}>
              <Link href="/" className={styles.cancelBtn}>
                Cancel
              </Link>
              <button
                type="button"
                className={styles.acceptBtn}
                onClick={() => void startSession()}
                disabled={loading}
              >
                {loading ? "Starting…" : "I understand — start chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
