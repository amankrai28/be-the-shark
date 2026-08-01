# Be The Shark — Claude Code Context

## What this project is

**Be The Shark** is a Shark Tank India deal simulator. The player reads an anonymized real pitch (industry, city, revenue, ask amount, ask equity — company/founder names redacted), then decides: go out, match the ask, or counter-offer. The real outcome is revealed and the player is scored on accuracy. Wordle-style daily-challenge model. Target audience: Shark Tank India's 10M+ viewers, startup enthusiasts, B-school students.

Full product plan: `docs/PROJECT_PLAN.md` (roadmap, monetization, GTM, legal).

## Current state of the code — READ THIS FIRST

- `index.html` is a **compiled Parcel production build** (minified React + framer-motion + Tailwind) downloaded from a claude.ai artifact ("v6 verified"). It is fully playable standalone — open it in a browser. **The original JSX source is not in this repo.**
- `data/pitches.json` — the full game dataset, **extracted from the bundle**: 478 real pitches from Shark Tank India Seasons 1–3 (268 deals, 210 no-deals; difficulty tags: 73 easy / 222 medium / 183 hard). Schema per pitch: `id, season, episode, industry, city, description, yearsInBusiness, annualRevenue, profitMargin, employees, askAmount (₹ lakhs), askEquity (%), dealMade, dealAmount, dealEquity, investingSharks[], companyName, founderName, productCategory, salesChannel, difficulty`.

### Implication for development

Do NOT try to hand-edit the minified bundle. The intended path (see `TASKS.md`) is to **rebuild the app as a proper Vite + React + Tailwind project**, using:

1. `data/pitches.json` as the data source (import or fetch),
2. `index.html` as the living spec — run it in a browser to see exact UI, copy, animations, and flows to reproduce,
3. the game rules below as the source of truth for logic.

Keep the old build available (e.g. move to `prototype/index.html`) until the rebuild reaches feature parity.

## Game rules as implemented in v6 (verified against the bundle)

Scoring per pitch, max 1000:

- **Deal call — 300 pts**: correctly predict deal vs no deal.
- **Amount accuracy — 350 pts**: `max(0, round(350 * (1 - |offered - actual| / actual * 2)))` — i.e. linear falloff, zero points at 50% deviation.
- **Equity accuracy — 350 pts**: same formula against actual deal equity.
- Correctly calling "no deal" on a no-deal pitch awards the full 350 + 350.
- Note: the project plan describes a 300/250/250/200 split including a shark-selection bonus. **v6 does not implement shark selection.** Treat this as a product decision to revisit, not a bug.

Player actions: Go Out (no deal) / Match the Ask / Counter Offer (custom amount + equity).

Modes present in v6: a daily pitch ("New pitch every day", numbered e.g. "Pitch #213") plus a **Practice mode limited to 3 plays/day**. Home screen: `docs/screenshot.png`.

Persistence: `localStorage` — games played, total score, best score, current/best streak, score distribution, last played date (streak logic checks consecutive days).

Sharing: `navigator.share` with clipboard fallback; share text includes score breakdown, streak, and "Play at betheshark.in".

## Tech decisions (from the plan)

- Frontend: React + Tailwind (rebuild with Vite for simplicity; Next.js only if/when SEO or server features are needed).
- MVP needs **no backend** — static JSON data, date-seeded daily pitch. Supabase (auth, leaderboards) is Phase 2.
- Hosting: Vercel free tier. Domain candidate: betheshark.in.
- Share cards: html-to-image or Vercel OG/Satori (Phase 1 backlog).

## Hard constraints (legal — do not violate)

- Never use "Shark Tank" or "Shark Tank India" in the product name, title tag, or branding. "Inspired by publicly available data" phrasing only in marketing copy.
- No Sony footage, logos, or trademarks anywhere.
- Real shark names (`data/pitches.json` → `investingSharks`: ashneer, aman, namita, peyush, vineeta, anupam, ghazal, amit, vikas, azhar, radhika, deepinder, ronnie, varun) **must not be shown in gameplay UI without consent** — display generically ("Shark A", silhouettes) or only post-reveal with care. Flag any UI change that surfaces them.
- Deal facts are public data (not copyrightable); pitch descriptions must remain original writing.

## Conventions

- Work through `TASKS.md` top to bottom; it is the prioritized backlog. Check off items as you complete them.
- Commit in small, logical units with clear messages (this repo is a portfolio piece — history will be read).
- Mobile-first: the audience is overwhelmingly on phones with low bandwidth. Test at 360px width. Keep the bundle lean.
- Currency is Indian format: ₹ lakhs and crores (1 crore = 100 lakhs). `askAmount`/`dealAmount` are in lakhs.
- Anti-cheat: never render `companyName`/`founderName` before the reveal step, including in DOM/network-visible places (a determined player will open DevTools — for MVP, obfuscation beyond "not on screen" is nice-to-have, not required).
