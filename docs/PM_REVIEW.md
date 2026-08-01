# PM Review — Be The Shark (v6 prototype + dataset)

Date: 2026-08-01. Reviewed: `index.html` (v6 bundle, logic extracted), `data/pitches.json` (478 pitches), plan docs.

---

## 1. What the product does (PM definition)

**One-liner:** A Wordle-style daily prediction game where Shark Tank India fans read a real, anonymized pitch and bet their judgment against what actually happened on the show.

**Core loop (60–90 seconds):**
1. **Read** an anonymized pitch card: industry, city, description, years in business, revenue, margin, ask (₹ lakhs) and equity (%).
2. **Decide** — one of three actions: *Go Out* (predict no deal), *Match the Ask*, or *Counter Offer* (custom amount + equity).
3. **Reveal** — the real outcome: deal or not, actual amount/equity, which sharks invested, and the company/founder identity.
4. **Score** — up to 1000 points: 300 for the deal/no-deal call, 350 for amount accuracy, 350 for equity accuracy (linear falloff, zero at 50% deviation; a correct "no deal" call awards the full 700 accuracy points).
5. **Retain & spread** — streaks, best score, and score distribution in `localStorage`; share text with emoji bar breakdown ("Play at betheshark.in").

**Modes:** one Daily Pitch (same for everyone, in theory — see breakage #1) plus Practice mode capped at 3 plays/day.

**Why it can win:** zero-marginal-cost content (478 real pitches ≈ 16 months of dailies), a fanbase of 10M+ with no competing interactive simulator, and a share mechanic that doubles as acquisition. The "I'd have done better than the sharks" itch is real and untested in this market.

**Who it's for:** Shark Tank India viewers, startup-curious professionals, B-school students. Mobile-first, low bandwidth, Indian-number-format native (₹ lakhs/crores).

---

## 2. Where it breaks

### A. Breaks today, in the shipped prototype (bugs)

1. **The daily pitch is not the same for everyone, and skips/repeats content.**
   Selection is `pitches[(YYYY*10000 + MM*100 + DD) % 478]` using the *device's local date*.
   - Players in different timezones get different "daily" pitches near midnight — kills the shared-puzzle social contract that makes Wordle work.
   - At month boundaries the date integer jumps (Aug 31 → Sep 1 is +70), so ~60 pitches per month-change are skipped and the cycle revisits others; the schedule is neither sequential nor uniform.
   - The displayed "Pitch #N" is computed separately (days since 2026-01-01), so the number and the pitch content aren't stably linked.

2. **Division-by-zero pitch: id 244** (`askAmount: 0`, `dealMade: true`, `dealAmount: 0`). The scoring formula divides by the actual amount (falling back to ask — also 0), producing `NaN`/0 scores. On its rotation day, the daily game is broken for everyone.

3. **Anti-cheat is nonexistent in practice.** All 478 `companyName` values ship inside the bundle (and in `data/pitches.json` once we fetch it client-side). Anyone can view-source today's answer. Accepted for MVP per CLAUDE.md, but the *daily leaderboard* plan (Phase 2) is dead on arrival until answers move server-side or are at least encrypted-at-rest with reveal-time decryption.

4. **Streak logic trusts the device clock.** Local-date string comparison means a clock change grants replays/streak repair. Acceptable for MVP; fatal for leaderboards.

### B. Breaks on the data (the user's #1 priority: accuracy)

5. **Coverage gap: Seasons 4–5 are missing.** The dataset is S1–S3 only (152/169/157). S4 (2025) and S5 (2026) have aired. For a product whose promise is "the latest real deals," this is the single biggest content gap — and the freshest seasons are the ones current viewers remember and want to play.

6. **The schema can't represent how deals actually happen on the show.** Real Shark Tank India deals frequently include **debt components** (e.g., ₹50L for 2% + ₹50L debt at X%), royalty structures, and conditional advisory equity. The schema has only `dealAmount`/`dealEquity`. Flattening a debt+equity deal into "amount for equity" misstates the outcome — players who remember the episode will call it wrong, and they're the core audience. This is an accuracy bug, not a modeling nicety.

7. **Dead and hollow fields.**
   - `employees` is `0` for **all 478 pitches** — the field is broken; if the UI renders it, it renders misinformation.
   - `profitMargin` is `"N/A"` for 313/478 (65%).
   - `annualRevenue` is `"Not disclosed"`/`"Pre-revenue"` for 260/478 (54%) and is a display string in three formats (`"₹95 L"`, `"₹1.2 Cr"`, free text) — unusable for sorting/difficulty calibration without normalization.
   - 8 deal pitches have empty `investingSharks`; `founderName` is empty on many records; some episodes are `0`.

8. **No provenance or verification trail.** Spot-checks pass (Skippi: ask ₹45L/5% → deal ₹1Cr/15% all five sharks ✔; BluePine: ₹50L/5% → ₹75L/16% ✔), but there's no source column, no verification status, and no pipeline to audit or update records. "All deals accurate" requires a data pipeline with per-record sourcing, not a frozen JSON extract.

### C. Breaks structurally (product/process)

9. **The source code doesn't exist.** `index.html` is a minified Parcel artifact. Every fix above requires the Vite rebuild first; until then the live spec and the editable code are the same file, and it's read-only.

10. **Legal exposure sits in the reveal.** Real shark names appear post-reveal (arguably fine as public fact) but must never leak pre-reveal, and the product name/branding must stay clear of "Shark Tank" marks. The share text and OG tags are the highest-risk surfaces — audit them at build time, not by hand.

11. **Scoring design is unresolved.** v6 (300/350/350, no shark pick) diverges from the plan (300/250/250/200 with shark selection). Recommendation: **ship v6's split for MVP** — shark selection pre-reveal conflicts with the "no shark names in gameplay UI" legal constraint anyway. Revisit if/when consent or generic-silhouette UX is designed. Separately, the linear-falloff-to-50% formula is harsh on outlier deals where sharks 5×'d the ask (Skippi: matching the ask scores 0 on amount despite being a reasonable play) — consider log-scale or capped-ratio falloff as a tuning task, with unit tests locking whatever we choose.

---

## 3. Cut-line

**Must fix before deploy (ship-blockers):**
- Rebuild as Vite + React + Tailwind source (prerequisite for everything).
- Deterministic daily pitch: UTC or IST-fixed epoch date → sequential index into a shuffled-once order; Pitch # derived from the same index.
- Data QA pass: fix/remove id 244, drop `employees` from UI, normalize `annualRevenue` into structured fields, resolve the 8 shark-less deals.
- Scoring unit tests (including zero/missing-value guards).
- Legal audit of name/branding surfaces in the rebuilt app.

**Fast-follow (pre-marketing-push, not pre-deploy):**
- S4–S5 data ingestion with per-record source links + verification status.
- Schema v2: debt/royalty components, structured revenue, `dataSource`, `verified`.
- Share card image, OG tags, PWA manifest.

**Backlog (unchanged from plan):** Supabase auth + leaderboards (requires server-side answers), Season Mode, Head-to-Head, monetization.
