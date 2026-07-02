# academAI — Technical Pitch

**Tagline:** Learn · Practice · Prevent

---

## One-liner

academAI is an AI literacy platform that teaches people to understand, practice with, and safely use AI — with guardrails, local Llama 2 inference, and audience-specific experiences for children, students, and the elderly.

---

## Problem

Most people encounter AI through generic chat tools that optimize for **usage**, not **literacy**. Learners rarely practice:

- Spotting scams and social-engineering tactics
- Recognising deepfakes and manipulated media
- Questioning biased or unverified AI outputs
- Prompting with safety and academic integrity in mind

Schools and community programmes need a platform that is **explainable**, **privacy-conscious**, and **hands-on** — not another black-box chatbot.

---

## Solution

**academAI** delivers structured AI literacy through three pillars:

| Pillar | Product | Outcome |
|--------|---------|---------|
| **Learn** | JSON-driven modules (deepfakes, bias, AI basics) | Plain-language understanding |
| **Practice** | Spot the Scam | Real-world judgment training |
| **Prevent** | Cadet Sandbox + orchestrator | Guardrailed live prompting |

Three audiences, one platform:

- **Under-14** — gamified, low-text, high engagement
- **Students / Lecturers** — dashboard, sandbox, critique workflow
- **Elderly** — voice-first, safety-forward, large-type UX

---

## Technical differentiators

1. **Guardrails before generation** — Cadet rules block harmful and EU-prohibited requests before any model call.
2. **Pluggable orchestration** — one API (`POST /api/orchestrate`) supports simulated, Ollama, LangGraph, and AutoGen backends.
3. **Local-first AI** — Llama 2 via Ollama keeps prompts on-network; no cloud API keys required.
4. **Explainable responses** — every reply includes backend, route, and disclosure metadata for teaching moments.
5. **Architecture-ready scale** — designed for ingestion pipelines, editor review, and ML profile recommendations.

---

## Stack (shipped)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, CSS Modules |
| Learning engine | Cadet engine, JSON modules, Spot the Scam bank |
| API | Next.js Route Handlers (`/api/orchestrate`, `/api/sessions`) |
| Orchestration | `src/lib/orchestrator` — guardrails → router → adapters |
| Inference | Ollama (Llama 2), Python sidecars (LangGraph :8001, AutoGen :8002) |

---

## Elevator pitch (60 seconds)

> academAI helps schools, universities, and community programs teach AI literacy to everyone — from children to the elderly. Learners follow **Learn · Practice · Prevent**: short modules explain concepts in plain language; Spot the Scam builds real-world judgment; Cadet Sandbox lets students practice prompting with live guardrails and local Llama 2 inference. Under the hood, a single orchestration API swaps between simulated, Ollama, LangGraph, and AutoGen backends without changing the UI. Prompts never skip safety checks — input is scanned for EU AI Act issues and harmful content; outputs are redacted and labeled. Built on Next.js today and designed to scale to ingestion pipelines, editor review queues, and profile-based recommendations — while staying explainable and privacy-conscious.

---

## Roadmap

| Phase | Capability | Status |
|-------|------------|--------|
| Now | Modules, Spot the Scam, Cadet Sandbox, Ollama orchestrator | Shipped |
| Now | LangGraph + AutoGen Python sidecars | Running |
| Next | Engagement persistence, ML profile recommendations | Designed |
| Next | RSS ingestion + editor review queue | Designed |
| Later | Auth (NextAuth), PostgreSQL, LMS export | Planned |

---

## Companion files

| File | Description |
|------|-------------|
| `academai-technical-architecture.svg` | Layered technical architecture (draw.io style) |
| `academai-orchestration-flow.svg` | Orchestration pipeline flowchart |
| `academai-technical-architecture.drawio` | Editable draw.io diagram |
| `academai-technical-overview.md` | Full overview with Mermaid source |

---

*academAI · Learn · Practice · Prevent*
