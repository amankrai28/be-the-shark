# Phase 2 Plan — Leaderboard, then Seasons 4–5

Method for each task: objective → design → failure modes → QC gates. A task is
done only when every QC gate passes against the objective.

---

## Task A — Community Leaderboard (Supabase)

### Objective

After finishing the daily pitch, a player can submit their score under a chosen
display name and see today's top scores and their own rank. Zero sign-up
friction, zero cost (Supabase free tier), and the game must remain fully
playable if the backend is slow, down, or paused. Honest labeling: scores are
client-computed, so it is a "community leaderboard", not a trust anchor.

### Design

- **Table `daily_scores`**: `id`, `created_at`, `pitch_number`, `score`,
  `player_name`, `client_id` (anonymous UUID minted once per browser).
  No emails, no PII beyond a self-chosen display name.
- **Integrity at the database layer** (not the client): CHECK constraints
  (score 0–1000, name 2–20 chars, sane pitch number), UNIQUE
  `(pitch_number, client_id)` so a browser can submit once per day,
  RLS: anonymous role can INSERT and SELECT only — no UPDATE/DELETE.
- **Client**: plain `fetch` against the PostgREST endpoint (no SDK — keeps the
  bundle lean). Config via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
  (publishable key, safe in the client). Submission UI on the score screen
  (opt-in, name remembered); leaderboard view shows today's top 50 + your rank
  + player count.
- **Degradation**: every network call has a timeout and a quiet failure path;
  the score screen and stats never block on the leaderboard.

### Failure modes & mitigations

| Failure | Mitigation |
|---|---|
| Supabase unreachable / project paused (free tier pauses after ~1 week idle) | Game fully playable without it; leaderboard shows a quiet "unavailable" state; submission offers retry |
| Duplicate/replayed submissions | UNIQUE constraint; client treats conflict as "already submitted" |
| Fabricated scores via direct API calls | Accepted at portfolio scale; bounds enforced by CHECK; labeled "community leaderboard"; server-side scoring is the future fix |
| Offensive display names | Client-side blocklist + length cap; DB length CHECK; accepted residual risk |
| RLS misconfiguration | QC gate explicitly tests that anon cannot UPDATE/DELETE and cannot read other tables |
| Leaderboard traffic slowing game load | Leaderboard fetched lazily only when opened, never on boot |

### QC gates (must all pass)

1. **Constraint tests**: invalid score (-1, 1001), bad name lengths, duplicate
   (pitch, client) all rejected by the DB — verified via REST calls.
2. **RLS tests**: anon INSERT ✓, SELECT ✓, UPDATE ✗, DELETE ✗.
3. **Unit tests**: leaderboard client module with mocked fetch — submit, ranked
   fetch, conflict → "already submitted", timeout → graceful error.
4. **Kill-switch test**: run the app with a bogus Supabase URL — full round
   playable, no console spam, leaderboard shows unavailable state.
5. **Production E2E**: submit a real score on the live site, see it ranked;
   second submit correctly no-ops; row visible in the table.

---

## Task B — Seasons 4–5 Ingestion

### Objective

Every Season 4 and Season 5 pitch that aired joins the dataset at the same
accuracy bar as the verified S1–S3 records: parsed from Wikipedia's episode
tables, per-record `dataSource`, debt/royalty components captured, validator
passing, and descriptions that are original writing with no name leaks.
Existing players' daily schedule must not shift: the current 474-pitch order is
pinned before new pitches are appended.

### Design

1. **Pin the schedule first**: freeze today's seeded-shuffle order into
   `src/data/dailyOrder.json` (an explicit id list). `dailyPitch()` reads the
   pinned list; new pitches are appended to the end of the cycle. A snapshot
   test asserts the first 474 entries never change.
2. **Parse** Wikipedia S4/S5 pitch tables with the existing rowspan-aware
   parser (headers asserted — fail loudly on format drift).
3. **Transform** each row into a schema-v2 record: ask/deal/debt parsed from
   the deal string; sharks mapped to keys (new sharks added to the map:
   e.g. Kunal Bahl, Viraj Bahl and other S4/S5 panelists); episode from the
   table; `dataSource` = the season page URL.
4. **Enrich honestly**: fields Wikipedia doesn't carry (city, revenue, margin,
   years) are marked "Not disclosed"/hidden rather than guessed. Difficulty
   assigned by a simple deterministic rule (deal-vs-ask deviation).
5. **Descriptions**: written as original 1–2 sentence anonymized copy derived
   from the idea column — never the company name, never verbatim source text;
   the validator's leak check runs over all of them.
6. **Merge** with ids continuing after the current max; validator extended to
   seasons 1–5.

### Failure modes & mitigations

| Failure | Mitigation |
|---|---|
| Wikipedia table format differs for S4/S5 | Parser asserts expected headers; loud failure, no silent misparse |
| Deal-string variants misparse (₹ formats, "undisclosed", advisory equity) | Plausibility bounds in validator; every unparseable row logged and manually resolved — no silent drops |
| Symbolic/stunt asks reappear | Same bounds catch them; excluded like Cocofit/Dharaksha |
| Advisory-equity or royalty-only deals | Cash+equity portion recorded; structure noted in `dealNote`; unscorable ones excluded |
| Name leaks in generated descriptions | Validator leak check extended over new records |
| Daily schedule reshuffles for live players | Pinned order file + snapshot test (QC gate, not hope) |
| Season 5 partially aired | Ingest aired episodes only; record the cutoff in the dataset notes |
| Returning companies (repeat pitches) | Allowed as separate records per season; per-season dedupe enforced |

### QC gates (must all pass)

1. **Full validator suite** green over the merged dataset (bounds, leaks,
   shark keys, per-season dedupe, no-deal field hygiene).
2. **Round-trip check**: re-parse every new record's source deal string and
   compare to stored values — 100% agreement or the row is flagged.
3. **Reconciliation count**: wiki rows parsed = records added + explicitly
   logged exclusions (with reasons). Zero silent drops.
4. **Schedule continuity**: snapshot test proves days 1–474 of the daily
   order are byte-identical before and after the merge.
5. **Spot-check sample**: 10 random new records manually verified against a
   second source (SharkTankSeason company pages).
6. **Render QC**: a forced-day playthrough of at least one S4 and one S5 pitch
   in the browser — pitch card, reveal, and scoring all correct with sparse
   fields.
