# Be The Shark — Product Plan (condensed)

Source of truth: `Be_The_Shark_Project_Plan.docx` in the "Shark Tank Game Design" Claude project (Feb 2026). This is the working summary.

## Concept

Web game: read an anonymized Shark Tank India pitch, make your deal (go out / match ask / counter / pick partner sharks), see the real outcome, get scored on accuracy. Free-to-play daily challenge (Wordle model). Differentiator: no interactive deal simulator exists using real Shark Tank India data.

## Game modes (planned)

1. **Daily Pitch** — one pitch/day, same for everyone, weekly leaderboard resets. *(MVP)*
2. **Season Mode** — play a whole season sequentially, track portfolio performance.
3. **Head-to-Head** — challenge a friend via link, same pitch, compare scores.
4. **Speed Round** — 10 pitches, 30s each, deal/no-deal only.

## Scoring (per plan — note v6 prototype differs, see CLAUDE.md)

Deal-or-no-deal 300 · amount 250 · equity 250 · shark selection 200 = 1000.

## Anti-cheat

Redact company name, founder, brand references, uniquely identifying details. Show: industry, city, generalized description, years, revenue, margin, ask, equity, employees, channel. Reveal all post-submit.

## Data

Kaggle Shark Tank India dataset (S1–3) + manual curation for S4–5 (SharkTankSeason.com etc.). ~400+ pitches ≈ 13 months of daily content. Pipeline: clean → anonymize descriptions (original writing) → difficulty-tag → QA for searchability.

## Stack

Next.js/React + Tailwind · Supabase (Postgres + auth) from Phase 2 · Vercel hosting · Plausible/PostHog analytics · Satori/html-to-image for share cards. MVP can be fully static (JSON + date-seeded daily pitch, no DB).

## Roadmap

- **P1 MVP (wk 1–3):** dataset, core UI, daily seed, share card, Vercel deploy, SEO/OG.
- **P2 Retention (wk 4–6):** Supabase auth (Google + phone OTP), streaks, leaderboards, Season Mode, portfolio dashboard, S4–5 data.
- **P3 Social (wk 7–10):** Head-to-Head, WhatsApp deep links, Speed Round, "which shark are you" profile, PWA push.
- **P4 Monetization (wk 11–14):** freemium (1 free pitch/day; Pro ₹49–99/mo), interstitial ads, affiliate links post-reveal, sponsored pitch packs.

## Costs & revenue (summary)

DIY MVP ≈ ₹500–1,500 total (domain only; free tiers otherwise). At-scale opex ₹3,750–5,000/mo. Conservative projections: Month 12 → 100K DAU, ~4K Pro subs, ₹4.3L/mo total revenue. Assumes organic/social growth only.

## GTM

Launch 1–2 weeks before a new season premiere. Channels: shareable score card (primary), fan communities (r/sharktankindia, IG fan pages), B-school/startup communities, influencer seeding, SEO content on deal statistics.

## Legal (hard constraints)

- No "Shark Tank" in product name/branding; "inspired by public data" only.
- No Sony footage or trademarks.
- Deal facts are public/not copyrightable; descriptions must be original writing.
- Real shark names not in gameplay without consent — use generic labels.
- Budget ₹5–15K for a legal review pre-commercial-launch.

## KPIs (Month 3 → Month 6 targets)

DAU 5K → 25K · D7 retention 30% → 40% · D30 15% → 25% · share rate 10% → 15% · Pro conversion 3% → 5% · session 3 → 5 min.
