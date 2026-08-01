# 🦈 Be The Shark

**A Shark Tank India deal simulator.** Read a real (anonymized) startup pitch — industry, city, revenue, the founder's ask — and make your call: go out, match the ask, or counter-offer. Then the real outcome is revealed and you're scored on how close your instincts came to the actual deal. Wordle-style daily challenge, built for the show's 10M+ fanbase.

## Play it

```bash
npm install && npm run dev
```

Mobile-first — best viewed at phone width.

## How scoring works (max 1000/pitch)

| Component | Points | Logic |
|---|---|---|
| Deal call | 300 | Did you correctly predict deal vs. no deal? |
| Amount accuracy | 350 | Linear falloff by % deviation from the actual deal amount |
| Equity accuracy | 350 | Linear falloff by % deviation from the actual equity |

Streaks, best score, and score distribution are tracked locally. Results are shareable.

## The data

`data/pitches.json` — 474 real pitches from Shark Tank India Seasons 1–3, each with industry, financials, ask, actual outcome, and investing sharks. 89% of records are cross-verified against public episode tables (per-record `dataSource` links); 57 deals carry their real debt components, scored against the equity portion. Company and founder names are hidden during play (anti-cheat) and revealed after you commit to your deal. Deal facts are public information; descriptions are original writing.

## Tech

Vite + React + TypeScript + Tailwind + framer-motion. Fully static — no backend. 38 unit tests cover scoring, the timezone-safe daily-pitch selection, streak edge cases, and a data-quality gate. Deploys to Vercel; Supabase later for accounts and leaderboards.

## Repo guide

- `src/` — application source (components, game logic in `src/lib/`)
- `data/pitches.json` — canonical dataset (474 pitches, schema v2 with debt + provenance fields)
- `scripts/` — build-time data prep (name obfuscation) and the data validator
- `prototype/index.html` — original compiled v6 prototype, kept as the visual spec
- `CLAUDE.md` — development context for Claude Code
- `TASKS.md` — prioritized backlog · `docs/PROJECT_PLAN.md` — product plan · `docs/PM_REVIEW.md` — PM findings

---

*Not affiliated with Shark Tank India or Sony Pictures. Built on publicly available deal data.*
