# AI for All (AIfA) — System Architecture Blueprint

## Mission & Philosophy

**AI for All** demystifies AI for three audiences: Under 14, Students/Lecturers, and the Elderly. Teaching follows **See it → Touch it → Tweak it**, using physical analogies (e.g., the Super-Smart Puppy) instead of CS jargon.

**SDG alignment:** Quality Education (4), Reduced Inequalities (10), Sustainable Communities (11), Partnerships (17).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js App Router (Frontend)                │
│  /dashboard/[profile]  ·  /modules/[slug]  ·  Voice UI (Elderly) │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST / tRPC / Server Actions
┌────────────────────────────▼────────────────────────────────────┐
│              API Gateway + Auth (NextAuth / Clerk / Auth0)       │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ User Service  │  │ Learning Service │  │ Ingestion Worker │
│ + ML Profiler │  │ Modules/Sessions │  │ RSS → LLM Draft  │
└───────┬───────┘  └────────┬─────────┘  └────────┬─────────┘
        │                   │                      │
        └───────────────────┼──────────────────────┘
                            ▼
              ┌─────────────────────────┐
              │ PostgreSQL + Redis       │
              │ S3 (media) · Vector DB   │
              └─────────────────────────┘
```

---

## 1. Backend & AI Orchestration Layer

### Authentication

| Concern | Approach |
|---------|----------|
| Identity | OAuth 2.0 / OIDC via NextAuth.js or Clerk |
| Profiles | Onboarding selects `under-14`, `students-lecturers`, or `elderly` |
| Under-14 | Parental consent flow; COPPA-aware data minimization |
| Sessions | JWT (short-lived) + httpOnly refresh cookie |
| RBAC | `learner`, `editor`, `admin` — editors approve ingested drafts |

### Lightweight ML Profile Classifier

**Goal:** Map behavior → literacy band + fear/confidence topics → module recommendations.

**Feature vector (per user, rolling 30-day window):**

- `completion_rate`, `avg_hints_per_module`, `avg_time_per_step`
- `modality_affinity` (see/touch/tweak engagement ratios)
- `topic_scores` (deepfakes, bias, prompts, scams)
- `profile_one_hot` (audience segment)
- `struggle_indicator_frequency`

**Model:** Logistic regression or gradient-boosted trees (XGBoost/LightGBM) — interpretable, fast, retrainable weekly. Not a deep neural net; editors and auditors must explain outputs.

**Pipeline:**

1. `ModuleSession` events stream to Kafka/Redis queue
2. Nightly batch aggregates features in `user_learning_features`
3. Classifier outputs: `literacy_band`, `fear_reduction_score`, `next_module_ids[]`
4. Served via `/api/v1/profile/recommendations`

**AI orchestration (content, not profiling):**

- LLM calls routed through an orchestration layer (LangChain/LiteLLM)
- Prompt templates per audience profile
- Human-in-the-loop: all auto-drafted modules require `editor_review` before publish

---

## 2. Automated Content Ingestion Loop

```
RSS/API Sources → Fetcher → Dedup → LLM Simplifier → Draft Module → Editor Queue → Publish
```

### Sources (examples)

- arXiv `cs.AI`, `cs.CY` RSS
- MIT Technology Review AI feed
- UNESCO / OECD education tech bulletins
- Curated trustworthy news APIs (NewsAPI with allowlist)

### Worker logic (pseudocode)

```typescript
// services/ingestion/worker.ts
async function ingestionTick() {
  const items = await fetchNewFeedItems(sources, since: lastCheckpoint);
  for (const item of deduplicate(items)) {
    const relevance = await llm.classifyRelevance(item); // 0-1
    if (relevance < 0.6) continue;

    const drafts = await llm.generateModuleDrafts({
      source: item,
      audiences: ["under-14", "students-lecturers", "elderly"],
      framework: ["see", "touch", "tweak"],
      constraints: "No jargon; analogies required; SDG tags",
    });

    for (const draft of drafts) {
      await db.modules.insert({
        ...draft,
        ingestionMeta: {
          sourceUrl: item.url,
          draftStatus: "editor_review",
          generatedAt: new Date(),
        },
      });
      await notifyEditors(draft);
    }
  }
  await saveCheckpoint();
}
```

### LLM pipeline stages

1. **Summarize** — Extract 3 learner-relevant facts from source
2. **Translate** — Rewrite per audience (3 variants)
3. **Structure** — Emit JSON matching `learning-module.schema.json`
4. **Safety scan** — Block harmful instructions; flag political/medical claims
5. **Queue** — Status `editor_review` until human approves

### Scheduling

- Cron every 6 hours (or event-driven on high-priority feeds)
- Rate limits + cost caps on LLM tokens
- Full audit log of prompts and outputs

---

## 3. Frontend Layout Matrix

### Under 14 — High gamification, low text

| Zone | Purpose |
|------|---------|
| Hero strip | Avatar, XP bar, streak flame |
| Adventure cards | Large icons, minimal labels |
| Sandbox | Drag-drop, tap hotspots, sound effects |
| Progress | Badges, confetti on completion |
| Typography | Large, short sentences; TTS on every card |

**Wireframe concept:**

```
[ Avatar | ⭐⭐⭐ | 🔥5 ]────────────────────────────
| 🎮 Spot Deepfake | 🐕 AI Puppy | ⚖️ Bias Buster |
|────────────── Sandbox: Real or Fake? ───────────|
|  [img] [img] [img]   →  drop zones: REAL | FAKE  |
```

### Students/Lecturers — Dashboard + workflow

| Zone | Purpose |
|------|---------|
| Resource sidebar | Playground, citations, LMS export tips |
| Module table | Sortable, duration, difficulty |
| Prompt playground | Split pane: prompt / output / critique checklist |
| Integration | "Use in Canvas/Moodle" export snippets |

### Elderly — Voice-first, safety-forward

| Zone | Purpose |
|------|---------|
| Read Aloud (primary) | Web Speech API + large play button |
| Safety alert panel | High contrast, gold accent, always visible |
| Lesson cards | 3-minute max, one action per screen |
| Navigation | Voice commands: "Go back", "Repeat", "Help" |
| Typography | 1.35rem+, 1.8 line-height, dark bg option |

---

## Tech Stack Recommendation

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 App Router, React 19, TypeScript |
| Styling | CSS modules or Tailwind (profile-specific themes) |
| API | Next.js Route Handlers + tRPC optional |
| DB | PostgreSQL (Prisma/Drizzle) |
| Cache/Queue | Redis + BullMQ for ingestion |
| Auth | NextAuth.js |
| ML | Python microservice (scikit-learn) or edge functions |
| Media | S3-compatible storage |
| Observability | OpenTelemetry, Sentry |

---

## Data Models (core tables)

- `users` — id, email, profile, consent_flags
- `modules` — JSON content + schema version
- `module_sessions` — engagement events blob
- `user_learning_features` — aggregated ML features
- `ingestion_items` — raw feed items + processing status
- `editor_reviews` — approve/reject/edit audit trail

---

## Security & Privacy

- Minimize PII for under-14; parental dashboard
- Engagement data anonymized for model training
- Editor approval mandatory for LLM-generated content
- Content Security Policy, rate limiting on API
- WCAG 2.2 AA for elderly profile (AAA contrast target)
