# AI for All (AIfA)

Demystifying AI for everyone — through **See it, Touch it, Tweak it**.

## Audiences

- **Under 14** — Gamified sandboxes, minimal text
- **Students & Lecturers** — Dashboards, prompt playgrounds, workflow tips
- **Elderly** — Voice-first, high contrast, scam safety alerts

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose a learning path.

## Documentation

- [Architecture Blueprint](./docs/ARCHITECTURE.md)
- [Cadet Sandbox Engine](./ARCHITECTURE.md) — prompt scoring, EU AI Act rules, missions
- [Design Tokens](./DESIGN_TOKENS.md) — Cadet warm-paper palette
- [Directory Structure](./docs/DIRECTORY_STRUCTURE.md)

## Integrated features (from added prototypes)

| Source file | Integrated as |
|-------------|----------------|
| `spot-the-scam-homepage.html` | `/dashboard/[profile]/modules/spot-the-scam` — React `SpotTheScamRunner` |
| `Cadet Sandbox.dc.html` | `/dashboard/students-lecturers/playground` — `CadetSandbox` + engine in `src/lib/cadet/` |
| `DESIGN_TOKENS.md` | Students profile theme + Cadet Sandbox UI |
| HTML prototypes | Reference copies in `public/prototypes/` |

## SDG Alignment

SDG 4 (Quality Education) · SDG 10 (Reduced Inequalities) · SDG 11 (Sustainable Communities) · SDG 17 (Partnerships)
