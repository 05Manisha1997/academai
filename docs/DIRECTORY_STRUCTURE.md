# AI for All — Next.js App Router Structure

```
ai-for-all/
├── docs/
│   └── ARCHITECTURE.md              # System blueprint
├── schemas/
│   └── learning-module.schema.json  # JSON Schema for modules + sessions
├── content/
│   ├── modules/
│   │   └── spot-the-deepfake.json   # Sample module instance
│   └── scripts/
│       └── elderly-super-smart-puppy-intro.json
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout + metadata
│   │   ├── page.tsx                 # Profile selection landing
│   │   ├── globals.css              # Profile CSS variables
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts    # (planned) Auth
│   │   │   ├── sessions/route.ts              # (planned) Engagement POST
│   │   │   └── recommendations/route.ts       # (planned) ML profile API
│   │   └── dashboard/
│   │       └── [profile]/
│   │           ├── page.tsx                   # Dynamic profile dashboard
│   │           ├── playground/
│   │           │   └── page.tsx               # (planned) Prompt playground
│   │           └── modules/
│   │               └── [moduleSlug]/
│   │                   └── page.tsx           # Module simulation shell
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Under14Dashboard.tsx
│   │   │   ├── StudentsDashboard.tsx
│   │   │   └── ElderlyDashboard.tsx
│   │   ├── learning/
│   │   │   ├── ModuleRunner.tsx               # (planned) 3-step engine
│   │   │   ├── StepSee.tsx
│   │   │   ├── StepTouch.tsx
│   │   │   └── StepTweak.tsx
│   │   ├── elderly/
│   │   │   ├── VoiceNavigator.tsx             # (planned)
│   │   │   └── SafetyAlertPanel.tsx
│   │   └── shared/
│   │       └── EngagementTracker.tsx
│   ├── lib/
│   │   ├── engagement.ts                      # Event batching → API
│   │   └── profiles.ts
│   └── types/
│       ├── profiles.ts
│       └── learning-module.ts
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Routing

| Route | Audience | Purpose |
|-------|----------|---------|
| `/` | All | Choose learning path |
| `/dashboard/under-14` | Under 14 | Gamified hub |
| `/dashboard/students-lecturers` | Students | Resource + module dashboard |
| `/dashboard/elderly` | Elderly | Voice-first, safety tips |
| `/dashboard/[profile]/modules/[moduleSlug]` | Per profile | Interactive module |

`generateStaticParams` pre-builds all three profile dashboards for performance.
