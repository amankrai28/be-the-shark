# Be The Shark — Task Backlog

Prioritized backlog for the Claude Code workflow: **PM review → code rebuild/edits → deploy → GitHub portfolio**. Work top to bottom. Check items off as you go.

---

## Phase 0 — PM Review (product manager hat 🧢)

Play `index.html` in a browser first. Then produce `docs/PM_REVIEW.md` covering:

- [ ] **Heuristic playthrough**: play 5+ pitches (easy/medium/hard). Note friction: onboarding clarity, input ergonomics on mobile, reveal pacing, replay motivation.
- [ ] **Scoring design review**: v6 uses 300 (deal call) / 350 (amount) / 350 (equity), no shark-selection bonus; the project plan specified 300/250/250/200 *with* a shark bonus. Decide which is right and why. Consider: does the amount/equity formula (zero points at 50% deviation) feel fair on big-ask outlier pitches?
- [ ] **Retention gap analysis**: what exists (streaks, share text) vs. plan (daily pitch seed, leaderboards, Season Mode, share *image* card). Rank by impact/effort.
- [ ] **Anti-cheat check**: is company/founder data exposed pre-reveal in DOM or bundle? (It is — dataset ships in the client. Decide MVP stance.)
- [ ] **Legal audit**: title/branding contains no "Shark Tank"; where do real shark names appear in UI and is that acceptable pre-consent? (See CLAUDE.md hard constraints.)
- [ ] **Data QA sample**: spot-check 10 pitches in `data/pitches.json` against known outcomes; check for empty/`"N/A"` fields (`profitMargin` is often N/A, `employees` often 0) and how UI handles them.
- [ ] Output: `docs/PM_REVIEW.md` with findings + a cut-line — which fixes ship before deploy, which go to backlog.

## Phase 1 — Rebuild as editable source (coder hat 👨‍💻)

The current `index.html` is a minified build and cannot be meaningfully edited. Rebuild:

- [ ] `mkdir prototype && git mv index.html prototype/index.html` — keep the working build as reference spec.
- [ ] Scaffold Vite + React + Tailwind in repo root (`npm create vite@latest`). Add `framer-motion` (used by v6 for reveal animations).
- [ ] Import `data/pitches.json`; build components to parity with the prototype: PitchCard, DealForm (go out / match / counter with amount+equity inputs), RevealSequence, ScoreBreakdown, StatsModal, ShareButton.
- [ ] Port scoring exactly as specified in CLAUDE.md (write unit tests for the scoring function first — Vitest).
- [ ] Port localStorage stats/streak logic (test the day-boundary streak edge cases).
- [ ] Side-by-side check vs `prototype/index.html` on mobile viewport (360px) until visually and behaviorally equivalent.
- [ ] Apply the ship-blocking fixes from `docs/PM_REVIEW.md`.

## Phase 2 — Quick wins from the plan (pre-deploy)

- [ ] Verify the existing **daily pitch** selection (v6 already shows "Pitch #N" + "New pitch every day" + a rate-limited Practice mode) is date-seeded and identical for all players; port it faithfully in the rebuild.
- [ ] Shareable **score card image** (html-to-image), Instagram-story 9:16 + square variants.
- [ ] Open Graph + SEO meta tags, favicon, `manifest.json` (PWA-lite).
- [ ] Lighthouse pass: aim 90+ performance/accessibility on mobile.

## Phase 3 — Deploy 🚀

- [ ] `vercel` CLI deploy (static Vite build; zero config). Hook repo to Vercel for auto-deploys from `main`.
- [ ] Custom domain if purchased (betheshark.in) — otherwise the `*.vercel.app` URL is fine for portfolio.
- [ ] Smoke-test the production URL on a real phone: play a full round, share flow, refresh persistence.
- [ ] Add Plausible or PostHog (free tier) — DAU, completion rate, share rate.

## Phase 4 — GitHub portfolio polish ⭐

- [ ] Create GitHub repo (`gh repo create be-the-shark --public --source=. --push`).
- [ ] README: hero screenshot/GIF of gameplay, live demo link, "what I built and why" narrative, tech stack, scoring math, data pipeline story (478 pitches extracted + anonymized), roadmap. Recruiters read READMEs, not code — this is the landing page.
- [ ] Fill in your full name in `LICENSE`.
- [ ] Add repo topics: `react`, `vite`, `game`, `shark-tank-india`, `tailwindcss`.
- [ ] Pin the repo on your GitHub profile.
- [ ] Optional: short demo GIF in README (record with phone-size viewport).

## Backlog (post-portfolio, from the product plan)

- Supabase auth (Google + phone OTP) · weekly/all-time leaderboards · Season Mode with portfolio tracking · Head-to-Head via share link · Speed Round · "Which shark do you invest like?" profile · Seasons 4–5 data · monetization (freemium gate, Rs 49–99/mo Pro).
