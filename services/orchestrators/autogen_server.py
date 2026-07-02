"""
academAI AutoGen orchestrator sidecar.

POST /orchestrate
Body: { prompt, system, route, profile }
Response: { text }

Agents: Tutor → Safety critic (sequential handoff via AutoGen-style loop).
Uses Ollama for generation; no cloud API keys required.
"""

from __future__ import annotations

import os

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

from shared import ollama_chat, safety_screen

app = FastAPI(title="academAI AutoGen Orchestrator", version="1.0.0")

MAX_TURNS = 2


class OrchestrateIn(BaseModel):
    prompt: str
    system: str = "You are a helpful AI literacy tutor."
    route: str = "general"
    profile: str | None = None


class OrchestrateOut(BaseModel):
    text: str
    orchestrator: str = "autogen"


class TutorAgent:
    name = "TutorAgent"

    async def reply(self, system: str, prompt: str, route: str) -> str:
        tutor_system = (
            f"{system}\n"
            f"You are {self.name} for academAI. Route: {route}. "
            "Teach clearly; encourage verification and ethical AI use."
        )
        return await ollama_chat(tutor_system, prompt)


class SafetyAgent:
    name = "SafetyAgent"

    async def review(self, draft: str) -> tuple[bool, str]:
        critic_system = (
            "You are SafetyAgent. Review the tutor draft for harmful, illegal, "
            "or privacy-violating content. If safe, return the draft unchanged. "
            "If unsafe, return a short refusal."
        )
        reviewed = await ollama_chat(
            critic_system,
            f"Review this draft for an educational sandbox:\n\n{draft[:4000]}",
        )
        ok, cleaned = safety_screen(reviewed if reviewed.strip() else draft)
        return ok, cleaned


tutor = TutorAgent()
safety = SafetyAgent()


@app.get("/health")
async def health():
    return {"status": "ok", "orchestrator": "autogen"}


@app.post("/orchestrate", response_model=OrchestrateOut)
async def orchestrate(body: OrchestrateIn):
  # AutoGen-style multi-agent round: tutor drafts, safety critic approves/edits
    draft = await tutor.reply(body.system, body.prompt, body.route)
    for _ in range(MAX_TURNS):
        ok, text = await safety.review(draft)
        if ok:
            return OrchestrateOut(text=text)
        draft = text
    return OrchestrateOut(text=draft)


if __name__ == "__main__":
    port = int(os.getenv("AUTOGEN_PORT", "8002"))
    uvicorn.run("autogen_server:app", host="0.0.0.0", port=port, reload=False)
