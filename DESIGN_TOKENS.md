# Design Tokens — Cadet

Warm-paper palette, one blue accent pop, functional status colors. Playful but trustworthy; spans ages 12–18.

## Color

### Surfaces
| Token | Hex | Use |
|---|---|---|
| paper | `#F1EADB` | app background, paper slides |
| panel | `#FFFDF8` | top bar, right rail |
| rail | `#F6F0E3` | left missions rail |
| terminal | `#FBF6EC` | terminal background |
| card | `#FFFFFF` | cards, bubbles, composer |
| cream-card | `#FBF6EC` | default mission card |
| mint-card | `#EEF7F1` | completed mission card |
| ink | `#221E19` | dark slides, user bubble, ink bg |
| ink-card | `#2C2720` | cards on ink slides |

### Text
| Token | Hex | Use |
|---|---|---|
| ink | `#221E19` | primary text |
| body | `#544C40` | body on paper |
| muted | `#6E6557` | secondary |
| faint | `#8C8276` / `#9A8F7C` | labels, hints |
| on-dark | `#F1EADB` | text on ink |
| on-dark-muted | `#A89C88` | secondary on ink |

### Brand & status
| Token | Hex | Use |
|---|---|---|
| accent (pop) | `#2454CC` | primary accent, CTAs, logo |
| accent-shadow | `#163A86` | the `0 3px 0` hard shadow under accent buttons/logo |
| accent-light | `#6E92F0` | accent text on dark |
| eu-blue | `#2F5BEA` | EU/compliance accent, mid-score gauge |
| eu-blue-light | `#7FA0FF` | blue on dark |
| green (safe) | `#1F9E6F` | safe status, completed, high score |
| green-text | `#1F8A5F` | green text on light |
| amber (caution) | `#E8911C` | warn status |
| amber-text | `#C77A12` | amber text on light |
| red (danger) | `#E23D43` | block status |

### Borders
`#E6DECB` (default) · `#EADFCB` (bubbles/composer) · `#EDE4D2` (subtle dividers) · `#E0D7C4` (mission default) · `#D8CFBE` (scrollbar, faint separators).

Status pills use a tinted bg: `rgba(<status>, .12–.14)` with the solid status color as text.

## Typography
| Role | Family | Weights | Notes |
|---|---|---|---|
| Display / headings | **Bricolage Grotesque** | 500–800 | titles, numbers, logo; tight tracking `-.02em` |
| Body / UI | **Hanken Grotesk** | 400–800 | all running text |
| Mono / labels | **Space Mono** | 400, 700 | the prompt textarea, token counts, kickers, provision badges |

Self-hosted `.woff2` in `/fonts` (latin + latin-ext). **No Google Fonts** — see `COMPLIANCE.md`.

### Type scale (Sandbox UI)
Body 14px · bubbles 14px · labels 10.5–12px · section titles 15px · gauge number 22px · big credit/quality numbers via Bricolage.

### Type scale (Deck, 1920×1080)
Kicker (Space Mono) 18px / `.18em` uppercase · title (`.ttl`) 58–104px / 800 / `-.022em` · body 22–33px · big numbers (`.num`) 54–96px / 800 / `-.03em`. Helper classes in the deck: `.kick`, `.ttl`, `.num`.

## Radius
pills `20–30px` · cards `13–24px` · buttons `11–13px` · badges/dots `7–10px` · logo square `10–18px`.

## Shadow
| Use | Value |
|---|---|
| accent button/logo | `0 3px 0 #163A86` (hard, no blur) |
| card lift | `0 1px 2px rgba(60,45,20,.04)` |
| composer | `0 6px 22px rgba(60,45,20,.06)` |
| terminal / modal | `0 24px 60px rgba(60,45,20,.12–.14)` |
| deck hero mock | `0 30px 70px rgba(60,45,20,.14)` |

## Motion (keyframes)
- `cadetRise` — `translateY(10px)→0`, opacity 0→1, `.25s ease` — message bubbles.
- `cadetPop` — `scale(.92)→1`, opacity 0→1, `.22s ease` — popup modal.
- `cadetDot` — bounce + opacity, `1s infinite`, staggered 0/.15/.3s — typing indicator.
- `cadetBlink` — opacity pulse — optional cursor.
- Hover: accent buttons `translateY(-1px)`; active `translateY(1px)` + collapse shadow to `0 1px 0`.

## Layout (Sandbox)
3-column: left **268px** (missions) · center **flex** (terminal) · right **300px** (coach), under a fixed top bar. Mission cards gap 8px; coach checklist gap 8px; example chips gap 8px. Generous 18–30px section padding.
