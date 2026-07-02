# academAI — Technical Overview (Downloadable)

**Tagline:** Learn · Practice · Prevent

> Full technical overview with Mermaid diagrams. For vector diagrams, use the SVG or draw.io files in this folder.

---

## Architecture diagram (draw.io style)

Layered technical architecture with swimlanes — solid boxes are shipped, dashed are planned.

```mermaid
flowchart TB
  subgraph ACTORS["Actors"]
    direction LR
    U14[Under-14 learners]
    STU[Students / Lecturers]
    ELD[Elderly learners]
    ED[Editors · planned]
  end

  subgraph PRES["Presentation layer — Next.js 15 · React 19"]
    direction LR
    HOME[Homepage]
    DASH[Dashboard]
    MOD[Module Runner]
    SCAM[Spot the Scam]
    CADET[Cadet Sandbox]
    PLAY[Prompt Playground]
    VOICE[Elderly Voice UI]
  end

  subgraph APP["Application layer — src/lib · src/components"]
    direction LR
    CADETENG[Cadet Engine]
    MODLOAD[Module Loader]
    SCAMLIB[Spot-the-Scam lib]
    ENG[Engagement Tracker]
    THEMES[Profile themes]
  end

  subgraph API["API layer — Route Handlers"]
    direction LR
    ORCH["POST /api/orchestrate"]
    SESS["POST /api/sessions"]
  end

  subgraph ORC["AI orchestration layer — pipeline.ts"]
    direction LR
    ING[Input guardrails]
    RT[Router]
    ADP[Model adapters]
    OUTG[Output guardrails]
    ING --> RT --> ADP --> OUTG
  end

  subgraph INF["Inference runtime"]
    direction LR
    SIM[Simulated]
    OLL[Ollama / Llama 2]
    LG[LangGraph :8001]
    AG[AutoGen :8002]
  end

  subgraph DATA["Data & configuration"]
    direction LR
    JSON[JSON modules]
    ENV[.env.local]
    PG[(PostgreSQL · planned)]
    REDIS[(Redis · planned)]
    S3[(S3 · planned)]
  end

  ACTORS -->|HTTPS| PRES
  PRES -->|RSC / fetch| APP
  APP --> API
  ORCH --> ORC
  ORC --> INF
  LG & AG -->|Ollama API| OLL
  APP --> JSON
  ORC --> ENV
```

**Vector export:** `academai-technical-architecture.svg` or `academai-technical-architecture.drawio`

---

## Orchestration flow diagram

```mermaid
flowchart TD
  A[User prompt] --> B[Input guardrails]
  B -->|block| C[Refusal — no model call]
  B -->|pass / warn| D[Router — tutor · safety · ingestion · general]
  D --> E[Model adapter]
  E --> F{Backend}
  F --> G[Simulated]
  F --> H[Ollama / Llama 2]
  F --> I[LangGraph graph]
  F --> J[AutoGen agents]
  I --> H
  J --> H
  G & H & I & J --> K[Output guardrails]
  K --> L[Response + metadata]
```

**Vector export:** `academai-orchestration-flow.svg`

**Guardrails (always on):**

| Stage | Checks |
|-------|--------|
| Input | EU AI Act, safety blocks, PII / academic integrity warnings |
| Output | Length cap, phone/email redaction, AI-generated disclosure label |

---

## Technical pitch

See `academai-technical-pitch.md` for the full investor/stakeholder pitch document.

---

*Generated for academAI · docs/exports/*
