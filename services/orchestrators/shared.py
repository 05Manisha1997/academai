"""Shared helpers for academAI Python orchestrator sidecars."""

from __future__ import annotations

import os
import re
from typing import Any

import httpx

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")
MAX_OUTPUT_CHARS = 12_000

PII_PATTERNS = [
    (re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b"), "[PHONE REDACTED]"),
    (re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I), "[EMAIL REDACTED]"),
]


def redact_pii(text: str) -> str:
    out = text
    for pattern, replacement in PII_PATTERNS:
        out = pattern.sub(replacement, out)
    return out


def truncate(text: str, limit: int = MAX_OUTPUT_CHARS) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n[truncated for safety]"


async def ollama_chat(system: str, user: str, model: str | None = None) -> str:
    """Call local Ollama; falls back to a template if Ollama is unreachable."""
    model = model or OLLAMA_MODEL
    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(f"{OLLAMA_BASE}/api/chat", json=payload)
            res.raise_for_status()
            data: dict[str, Any] = res.json()
            return (data.get("message") or {}).get("content") or ""
    except Exception as exc:
        return (
            f"[Ollama unavailable: {exc}]\n\n"
            "Simulated tutor reply: break the task into steps, cite sources, "
            "and verify claims before trusting AI output."
        )


def safety_screen(text: str) -> tuple[bool, str]:
    """Lightweight output safety pass (mirrors academAI output guardrails)."""
    lowered = text.lower()
    blocked_phrases = ("how to make a bomb", "bypass security", "steal password")
    if any(p in lowered for p in blocked_phrases):
        return False, "Response withheld by safety critic — please rephrase your question."
    return True, redact_pii(truncate(text))
