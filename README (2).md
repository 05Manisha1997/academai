# Handoff: Cadet — AI Fluency Platform for Youth (12–18)

## Overview
Cadet teaches secondary-school students to use AI **well and safely**. The core is a **token-free Sandbox**: a simulated AI-agent terminal where students practise prompt engineering with no real tokens spent and no data sent. As they type, a **Prompt Coach** grades the prompt, a **Safety Scanner** flags risky input, and an **EU AI Act rules engine** raises pop-ups mapped to specific legal provisions.

This bundle contains three design references:

| File | What it is | Fidelity |
|---|---|---|
| `Cadet Sandbox.dc.html` | The interactive prototype — terminal, coach, scanner, missions | **Hi-fi + working logic** |
| `Cadet Pitch Deck.dc.html` | 14-slide investor/stakeholder deck | Hi-fi static |
| `Cadet Brief.dc.html` | One-page product landing / brief | Hi-fi static |

Read these companion docs alongside this one:
- **`ARCHITECTURE.md`** — the rules engine (prompt scoring, safety scan, EU mapping, token model, simulated agent). **This is the part to port carefully.**
- **`COMPLIANCE.md`** — EU AI Act / GDPR mapping and the production data-handling rules.
- **`DESIGN_TOKENS.md`** — exact colors, type, spacing, radii, shadows.

## About the Design Files
The bundled files are **design references authored in HTML** (a lightweight component format — markup + a plain-JS logic class). They show intended look and behaviour; they are **not** meant to be shipped as-is. The task is to **recreate them in your target environment** (React, Vue, SwiftUI, native, etc.) using your established patterns, then port the **logic engine** in `ARCHITECTURE.md` as pure, well-tested functions.

If you have no environment yet, React + TypeScript is the natural fit (the prototype's logic is already a React-style class component) — but the engine is framework-agnostic and has zero dependencies.

## Fidelity
**Hi-fi.** Colors, typography, spacing, copy, and interactions are final-intent. Recreate the UI to match `DESIGN_TOKENS.md`. The Sandbox's behaviour (scoring, scanning, missions, popups) is real and specified exactly in `ARCHITECTURE.md` — treat that as the functional source of truth, not just a mock.

---

## Screens / Views (Sandbox)

The Sandbox is a single full-viewport screen, three columns under a top bar.

### Top bar
- **Left:** Cadet logo (coral rounded square "C", `0 3px 0 #D63E1E` drop-shadow) + wordmark + "SANDBOX" label.
- **Center:** "Progress" + 6 status dots (green `#1F9E6F` when a mission is done, else `#E0D7C4`) + `done/total` text.
- **Right:** "Sandbox credits" token meter (mono number) + a 120×8 progress bar (green fill, width = `credits/6000`) + a **Reset** button.

### Left rail — Missions (fixed 268px)
Scrollable list of 6 mission cards + a sticky "Now playing" footer.
- **Mission card:** 1.5px border, 13px radius, number badge (24px circle), title (700/13.5px), one-line objective (11.5px muted).
  - *Active:* white bg, coral border `#FF5A36`, coral badge.
  - *Done:* mint bg `#EEF7F1`, green border `#BFE6CF`, green badge with "✓", green title.
  - *Default:* cream bg `#FBF6EC`, border `#EDE4D2`.
- Clicking a card sets it active (updates the footer hint).

### Center — Terminal (flex)
- **Transcript** (scrolls, auto-scrolls to bottom on update): chat bubbles.
  - *User bubble:* right-aligned, ink bg `#221E19`, cream text, Space Mono, radius `16px 16px 4px 16px`, max-width 78%.
  - *Agent bubble:* left-aligned, white bg, 1px border `#EADFCB`, Hanken, radius `16px 16px 16px 4px`, max-width 88%. Label "🤖 Sandbox agent" in coral.
  - Each bubble has an uppercase mini-label above it. `white-space: pre-wrap` (responses contain `\n`).
  - *Typing indicator:* three coral dots, `cadetDot` bounce keyframe, staggered 0/.15/.3s.
- **Example chips:** "TRY:" + 5 pill buttons that load a preset prompt into the input. Two are styled as warnings (amber border), one as EU (blue border).
- **Disclosure bar** (above composer, persistent): "🔒 Private sandbox · runs on your device — nothing you type is stored or sent · 🤖 you're practising with a simulated AI, not a real person". *(This line satisfies AI Act Art. 50 disclosure — keep it.)*
- **Composer:** white card, 2px border whose color reflects the worst live signal (red block / amber warn / green if score ≥70 / else `#EADFCB`). Contains a Space-Mono textarea + a live footer (`N tokens · ≈ €cost · safety label`) + a coral **Run ▸** button (`0 3px 0 #D63E1E`). Enter submits; Shift+Enter = newline.

### Right rail — Prompt Coach (fixed 300px)
- Header: blue star badge + "Prompt Coach" + subtitle.
- **Quality gauge:** label + big score number (color-coded) + a 9px bar (width = score%, color thresholds below) + a one-line note that changes by score band.
- **Checklist** "Ingredients of a great prompt": 5 rows (Be specific / Give context / Assign a role / Ask for a format / Name the audience), each a dot (green ✓ when satisfied) + label + hint. Updates live as the student types.
- **Footer panel:** "Token cost of this run" (mono), "Safety scan" pill, "EU AI Act" pill — all live.

### Popup (modal)
Fires when a prompt trips a safety or EU rule. Header band colored by severity (red block / EU-blue block / amber warn), with icon + kicker + title. Body = plain-language explanation. A **provision badge** (e.g. `AI Act · Art. 50(4)`) + reference text. A "Try instead" fix line. Buttons: **Rewrite my prompt** (always) and **I understand — continue** (warn-severity only; block has no continue). See `ARCHITECTURE.md` for the full rule set.

---

## Interactions & Behavior
- **Live analysis:** every keystroke re-runs `analyze(input)` → updates gauge, checklist, token/cost, safety + EU pills, and composer border color. No debounce needed (pure synchronous function).
- **Run:** push user bubble → if a rule trips, gate (block = agent refuses + popup; warn = popup with continue) → else show typing indicator ~750ms → push agent reply → deduct tokens from credits → re-check mission completion.
- **Popup → Rewrite:** closes popup, restores the last user prompt into the input for editing.
- **Popup → Continue** (warn only): closes popup, proceeds to agent.
- **Reset:** restores initial state (fresh welcome message, 6000 credits, no missions done).
- **Animations:** bubbles `cadetRise` (10px up, .25s); popup `cadetPop` (scale .92→1, .22s); typing dots `cadetDot`.

## State Management
See `ARCHITECTURE.md §State` for the exact shape. Summary: `messages[]`, `input`, `running`, `credits` (start 6000), `active` mission index, `done{}` map, `popup`, `pending` (the gated prompt awaiting "continue").

## Assets
- **Fonts (self-hosted, included):** Bricolage Grotesque (display), Hanken Grotesk (body), Space Mono (mono/labels). The `.woff2` files live in `/fonts` at project root — **self-hosted on purpose** (no Google Fonts call → no third-party IP leak; see `COMPLIANCE.md`). Bundle equivalents in your app.
- **Icons:** currently emoji (🔒 🛡️ 🤖 🎓 etc.). For production, swap to your icon set if you have one; emoji are intentional only for the playful youth tone.
- **No images** — all UI is CSS.

## Files
- `Cadet Sandbox.dc.html` — prototype (markup + logic class; the logic is the engine).
- `Cadet Pitch Deck.dc.html` — deck (static slides).
- `Cadet Brief.dc.html` — landing (static).
- `ARCHITECTURE.md`, `COMPLIANCE.md`, `DESIGN_TOKENS.md` — specs.
