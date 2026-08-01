# 🦈 Be The Shark

**A Shark Tank India deal simulator.** Read a real (anonymized) startup pitch — industry, city, revenue, the founder's ask — and make your call: go out, match the ask, or counter-offer. Then the real outcome is revealed and you're scored on how close your instincts came to the actual deal. Wordle-style daily challenge, built for the show's 10M+ fanbase.

> **Status: work in progress.** `index.html` is the playable v6 prototype (open it in any browser). The repo is set up for a source rebuild — see `TASKS.md` for the roadmap and `CLAUDE.md` for full development context.

## Play it

Open `index.html` in a browser. Works fully offline, mobile-first.

## How scoring works (max 1000/pitch)

| Component | Points | Logic |
|---|---|---|
| Deal call | 300 | Did you correctly predict deal vs. no deal? |
| Amount accuracy | 350 | Linear falloff by % deviation from the actual deal amount |
| Equity accuracy | 350 | Linear falloff by % deviation from the actual equity |

Streaks, best score, and score distribution are tracked locally. Results are shareable.

## The data

`data/pitches.json` — 478 real pitches from Shark Tank India Seasons 1–3, each with industry, financials, ask, actual outcome, and investing sharks. Company and founder names are hidden during play (anti-cheat) and revealed after you commit to your deal. Deal facts are public information; descriptions are original writing.

## Tech

Prototype: React + Tailwind + framer-motion, compiled to a single self-contained HTML file. Planned production stack: Vite + React + Tailwind on Vercel (static, no backend needed for MVP), Supabase later for accounts and leaderboards.

## Repo guide

- `index.html` — playable prototype build
- `data/pitches.json` — full game dataset (478 pitches)
- `CLAUDE.md` — development context for Claude Code
- `TASKS.md` — prioritized backlog (PM review → rebuild → deploy → polish)
- `docs/PROJECT_PLAN.md` — full product plan (mechanics, roadmap, GTM, legal)

---

*Not affiliated with Shark Tank India or Sony Pictures. Built on publicly available deal data.*
