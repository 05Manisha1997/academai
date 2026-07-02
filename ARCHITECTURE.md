# Architecture — Cadet Sandbox Engine

The Sandbox's value is its **engine**: four pure, dependency-free functions plus a small state machine. Port these first; they are framework- and language-agnostic. Reference implementation below is JavaScript extracted from the prototype.

> All logic is **client-side and synchronous**. There is no network call, no model API, no storage. The "AI" is simulated. This is deliberate (see `COMPLIANCE.md`).

---

## State

```js
state = {
  messages: [ { role:'user'|'agent', text:string } ],
  input:    string,        // current draft
  running:  boolean,       // agent "typing"
  credits:  number,        // starts 6000 (sandbox token budget)
  active:   number,        // index of selected mission (0..5)
  done:     { [missionId]: true },
  popup:    null | RuleHit,
  pending:  null | { raw:string, a:Analysis },  // prompt held behind a warn popup
}
```

---

## 1. Token model

```js
estTokens(text) = max(0, ceil(text.trim().length / 4))   // ~4 chars/token heuristic

cost(tokens) {
  const eur = tokens * 0.000006;          // ≈ €6 per 1M tokens (illustrative)
  return eur < 0.001 ? '€0.0008' : '€' + eur.toFixed(4);
}
```
- A **run** spends `promptTokens + responseTokens`, deducted from `credits`.
- `responseTokens = 140 + round(score * 1.2)` (better prompts earn longer answers — a teaching signal).
- Credits floor at 0. The header bar shows `credits/6000` as a fill width.

---

## 2. Prompt quality scoring — `analyze(raw)`

Detects five "ingredients" via case-insensitive regex on the lowercased prompt, then sums weights.

| Ingredient | `has.*` | Trigger (regex, simplified) | Weight |
|---|---|---|---|
| Specific | `specific` | word count ≥ 12 | +16 |
| Context | `context` | `because\|so that\|for a\|context\|background\|the goal is\|i need\|i want\|since\|given` **or** contains `:` | +18 |
| Role | `role` | `act as\|you are\|pretend you're\|imagine you're\|as an? (expert\|teacher\|tutor\|coach\|scientist\|historian\|chef\|engineer)` | +16 |
| Format | `format` | `bullet\|list\|table\|steps\|step-by-step\|in \d+\|words\|paragraph\|json\|outline\|numbered\|format` | +16 |
| Audience | `audience` | `for a\|beginner\|explain like\|year old\|teenager\|student\|simple terms\|audience\|tone` | +12 |

```
score = 18 (base)
      + (specific ? 16 : 0) + (context ? 18 : 0) + (role ? 16 : 0)
      + (format ? 16 : 0)   + (audience ? 12 : 0)
      + (wordCount >= 25 ? 6 : 0)
score = min(100, score)
```

**Gauge color thresholds:** `≥70` green `#1F9E6F` · `40–69` blue `#2F5BEA` · `1–39` amber `#E8911C` · empty `#C9BFAC`.

The checklist ticks each ingredient green when its `has.*` is true.

---

## 3. Intent detection (for the simulated reply) — `intent(t)`

First match wins, in this order: `translate → summarize → code → write → brainstorm → plan → explain → general`. Each is a keyword regex (e.g. `summarize`: `summar|tl;dr|shorten|condense`; `code`: `code|function|python|javascript|program|debug|script|html|css`). Used only to pick a response template — not safety-critical.

---

## 4. Safety + EU rules engine — `scan(t)` → `RuleHit | null`

Returns the **first** matching rule. A `RuleHit` drives the popup:

```ts
type RuleHit = {
  kind: 'safety' | 'eu',
  severity: 'block' | 'warn',   // block = no "continue"; warn = user may proceed
  icon, kicker, title, body,    // popup copy
  refTag, refBg, refText,       // the provision badge + explanation
  fix,                          // "Try instead:" guidance
}
```

### Rule table (port each; keep the article references exact)

| # | kind / severity | Trigger summary | Provision badge | Why |
|---|---|---|---|---|
| 1 | safety / **block** | self-harm intent (`hurt myself`, `kill myself`, `self-harm`, `want to die`) | "Need help now?" | Route to human help — gentle, supportive copy; never answer. |
| 2 | safety / **block** | weapons / hacking / theft / poison / breaking in (`how to make a bomb/weapon/gun`, `hack into`, `steal`, `make a poison/drug`, `break into`) | Acceptable use | Dangerous/illegal — refuse in sandbox and reality. |
| 3 | eu / **block** | emotion recognition in education (`detect students' emotion`, `emotion recognition`, `scan their faces/emotions`, `read their mood`) | **AI Act · Art. 5(1)(f)** | Prohibited practice. |
| 4 | eu / **block** | social scoring (`rank students by`, `social scoring`, `score people by behaviour`, `trustworthiness score`) | **AI Act · Art. 5(1)(c)** | Prohibited practice. |
| 5 | eu / **block** | untargeted face scraping (`scrape faces/photos`, `build a facial recognition database`, `collect everyone's faces`) | **AI Act · Art. 5(1)(e)** | Prohibited practice. |
| 6 | eu / **warn** | deepfake / impersonation of a real person (`deepfake`, `fake video/photo/news of`, `impersonate`, `pretend to be <real person>`, `clone their voice`) | **AI Act · Art. 50(4)** | Allowed only if labelled AI-generated; may continue with that condition. |
| 7 | safety / **warn** | sharing personal data (`my address is`, `my phone number is`, `my password is`, `credit card`, `my full name is`, `i live at`…) | GDPR · data minimisation | Teach: don't send personal data; in sandbox it stays on-device, real AI would keep it. |
| 8 | safety / **warn** | academic dishonesty (`write my essay/homework`, `do my homework`, `answers to the test/exam/quiz`, `give me the answers`) | Academic integrity | Nudge toward AI-as-tutor, not AI-as-cheat. |

> **Order matters:** self-harm and danger (1–2) are checked before everything else. Keep that priority.
> The regexes are intentionally simple/transparent (teachable, auditable). In production, back them with a proper classifier **in addition to** these explicit rules — but never *remove* the explicit prohibited-practice rules; they are the compliance guarantee.

### Run gating
```
on Run:
  a = analyze(input); push user bubble; clear input
  if a.flag (= scan result):
     mark mission 'risk' (safety) or 'rules' (eu) as complete
     if severity == 'block':  open popup; agent posts a refusal; spend 0 tokens
     else (warn):             open popup with pending={raw,a}
  else: sendToAgent(raw, a)

popup "Rewrite":  close, restore last prompt into input
popup "Continue": (warn only) close; if eu → mark 'rules' done; sendToAgent(pending)
```

---

## 5. Simulated agent — `respond(raw, a)`
Pure templating, **no model call**. Picks a template by `a.intent` and branches on `a.score >= 60` (good vs vague). Good prompts get a short structured stub; vague prompts get a clarifying question (teaching vague-in → vague-out). Strips command words to extract a rough `topic`. Every reply ends with a "— sandbox preview —" disclaimer and a token line. Replace this entire function when you wire a real (supervised) model; everything else stays.

---

## 6. Missions

```
1 first   "First contact"  → any agent reply
2 context "Add context"    → a prompt scoring ≥ 60
3 role    "Give it a role" → has.role true
4 risk    "Spot the risk"  → any safety popup shown
5 rules   "Know the rules" → any EU popup acknowledged
6 tokens  "Token diet"     → reply received with promptTokens ≤ 30 AND score ≥ 50
```
Completion is checked after each run (and on popup-continue for `rules`). `done{}` drives the progress dots and card states.

---

## Porting checklist
1. `estTokens`, `cost`, `analyze`, `intent`, `scan`, `respond` → pure module, unit-tested (table-driven tests off the rule table above).
2. State machine (run / gate / popup / missions) → your state lib.
3. UI from `DESIGN_TOKENS.md`.
4. Keep the **disclosure bar** (Art. 50) and the **explicit prohibited-practice rules** (Art. 5) — these are not decorative.
