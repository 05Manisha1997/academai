# academAI Orchestration & Guardrails

Learn · Practice · Prevent — with a **guardrailed orchestration layer** before any model runs.

## Pipeline

```
User prompt
    │
    ▼
┌─────────────────┐
│ Input guardrails │  Cadet rules (EU AI Act, safety, academic integrity)
└────────┬────────┘
         │ block → return refusal (no model call)
         ▼
┌─────────────────┐
│ Router           │  tutor | safety | ingestion | general
└────────┬────────┘
         ▼
┌─────────────────┐
│ Model adapter    │  simulated | ollama (Llama 2) | langgraph | autogen
└────────┬────────┘
         ▼
┌─────────────────┐
│ Output guardrails│  PII redaction, length cap, EU disclosure label
└────────┬────────┘
         ▼
    Response + metadata
```

Implementation: `src/lib/orchestrator/pipeline.ts`  
API: `POST /api/orchestrate`

## Backends

| Backend | Use case | Config |
|---------|----------|--------|
| **simulated** | Default; no API keys; Cadet templated replies | `ORCHESTRATOR_BACKEND=simulated` |
| **ollama** | Local Llama 2/3 via [Ollama](https://ollama.com) | `OLLAMA_BASE_URL`, `OLLAMA_MODEL=llama2` |
| **langgraph** | Multi-step graphs (Python sidecar) | `LANGGRAPH_ORCHESTRATOR_URL` |
| **autogen** | Multi-agent workflows (Python sidecar) | `AUTOGEN_ORCHESTRATOR_URL` |

Optional: `ORCHESTRATOR_API_KEY` for HTTP sidecars.

## LangGraph vs AutoGen (when to use which)

| | **LangGraph** | **AutoGen** |
|---|---------------|-------------|
| Model | Stateful **graph** of nodes/edges | **Multi-agent** conversation |
| Best for | Ingestion loops, fixed pipelines (RSS → draft → editor) | Debate-style tutoring, role agents (coach + critic) |
| academAI fit | Content ingestion worker, module drafting | Cadet Sandbox “live” mode with tutor + safety critic |

**Llama 2 (Ollama):** good default for on-device, GDPR-friendly deployments — no prompt leaves your network.

## Guardrails (included)

**Input** (reuses Cadet `scan` + `analyze`):

- Block: self-harm, illegal requests, EU prohibited practices (emotion recognition in schools, social scoring, face scraping)
- Warn: deepfakes/impersonation, PII in prompts, academic dishonesty

**Output:**

- Max length truncation
- Phone/email redaction in displayed text
- `[AI-generated content]` label when EU transparency rules apply

## Example request

```bash
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain deepfakes simply for elderly learners","profile":"elderly"}'
```

## Python sidecar sketch (LangGraph)

```python
# services/langgraph_orchestrator/main.py
# POST /orchestrate → graph: validate → retrieve → generate → safety_check → return
```

## Python sidecar sketch (AutoGen)

```python
# services/autogen_orchestrator/main.py
# Agents: TutorAgent, SafetyAgent, EditorAgent — round-robin until consensus or max_turns
```

Wire URLs in `.env` and set `ORCHESTRATOR_BACKEND=langgraph` or `autogen`.

## Quick install (Windows)

```powershell
# 1. Ollama + Llama 2
winget install Ollama.Ollama --accept-source-agreements --accept-package-agreements
ollama pull llama2

# 2. Copy env and start Next.js
copy .env.example .env.local
npm run dev

# 3. Python sidecars (LangGraph :8001, AutoGen :8002)
npm run orchestrators
```

Cadet Sandbox defaults to **Live · Llama 2** mode and calls `POST /api/orchestrate`.
