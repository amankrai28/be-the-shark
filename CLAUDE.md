# Be The Shark — Claude Code Context

## What this project is

**Be The Shark** is a Shark Tank India deal simulator. The player reads an anonymized real pitch (industry, city, revenue, ask amount, ask equity — company/founder names redacted), then decides: go out, match the ask, or counter-offer. The real outcome is revealed and the player is scored on accuracy. Wordle-style daily-challenge model. Target audience: Shark Tank India's 10M+ viewers, startup enthusiasts, B-school students.

Full product plan: `docs/PROJECT_PLAN.md` (roadmap, monetization, GTM, legal).

## Current state of the code — READ THIS FIRST

- The app is a **Vite + React + TypeScript + Tailwind** project (rebuilt Aug 2026 from the v6 prototype, which is preserved at `prototype/index.html` as the visual spec). `npm run dev` to run, `npm test` for the 38-test suite (scoring, daily-pitch determinism, streaks, data validator).
- `data/pitches.json` — canonical dataset, **schema v2**: 474 real pitches from Seasons 1–3 (267 deals / 207 no-deals). 424 records (89%) are verified against public episode tables with per-record `dataSource` URLs; 57 deals carry `hasDebt`/`debtAmountLakhs`/`dealNote`. Removed from the original extraction: Dhruv Vidyut and three symbolic-ask stunt pitches (Cocofit ₹5, Watt ₹101, Dharaksha ₹1,250) — real episodes but unscorable on amount/equity. `employees` was dropped (dead field, was 0 for every record).
- Build-time prep: `scripts/prepare-data.mjs` generates `src/data/pitches.game.json` with company/founder names XOR+base64 obfuscated (casual anti-cheat only). Runs automatically via `predev`/`prebuild`.
- Daily pitch selection is **IST-pinned and seeded-shuffle based** (`src/lib/dailyPitch.ts`) — same pitch for every player worldwide, no skips at month boundaries (both were bugs in the prototype). Scoring lives in `src/lib/scoring.ts` with zero-division guards; debt deals score against the equity-cash portion.

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
