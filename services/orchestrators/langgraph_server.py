"""
academAI LangGraph orchestrator sidecar.

POST /orchestrate
Body: { prompt, system, route, profile }
Response: { text }

Graph: generate → safety_check → return
"""

from __future__ import annotations

import os
from typing import TypedDict

import uvicorn
from fastapi import FastAPI
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field

from shared import ollama_chat, safety_screen

app = FastAPI(title="academAI LangGraph Orchestrator", version="1.0.0")


class OrchestrateIn(BaseModel):
    prompt: str
    system: str = "You are a helpful AI literacy tutor."
    route: str = "general"
    profile: str | None = None


class OrchestrateOut(BaseModel):
    text: str
    orchestrator: str = "langgraph"


class GraphState(TypedDict):
    prompt: str
    system: str
    route: str
    draft: str
    text: str


async def generate_node(state: GraphState) -> GraphState:
    system = f"{state['system']}\nRoute: {state['route']}"
    draft = await ollama_chat(system, state["prompt"])
    return {**state, "draft": draft}


async def safety_node(state: GraphState) -> GraphState:
    ok, text = safety_screen(state["draft"])
    if not ok:
        return {**state, "text": text}
    return {**state, "text": text}


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("generate", generate_node)
    graph.add_node("safety", safety_node)
    graph.set_entry_point("generate")
    graph.add_edge("generate", "safety")
    graph.add_edge("safety", END)
    return graph.compile()


compiled = build_graph()


@app.get("/health")
async def health():
    return {"status": "ok", "orchestrator": "langgraph"}


@app.post("/orchestrate", response_model=OrchestrateOut)
async def orchestrate(body: OrchestrateIn):
    result = await compiled.ainvoke(
        {
            "prompt": body.prompt,
            "system": body.system,
            "route": body.route,
            "draft": "",
            "text": "",
        }
    )
    return OrchestrateOut(text=result["text"])


if __name__ == "__main__":
    port = int(os.getenv("LANGGRAPH_PORT", "8001"))
    uvicorn.run("langgraph_server:app", host="0.0.0.0", port=port, reload=False)
