# Worklog

The story of what got built and why — one entry per feature/session, written by Claude Code.
Pairs with `git log` (the exact diffs) and `docs/decisions/` (durable "why" calls).

---

## 2026-09-07 — Phase 0: infrastructure & workflow

**Branch:** `setup/context-files`

**Goal:** unblock development per `BUILD-PLAN.md` Phase 0 — get a real database behind the
6-table schema and confirm the app runs end-to-end, before any feature branches start.

**What happened:**

- Eri created the Supabase project (`sitetrack-adstar-dev`, Frankfurt) and added `DATABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`.
- The repo's `prisma/schema.prisma` and `prisma7.config.ts` turned out to be leftover from an
  earlier, incomplete attempt at Prisma 7 — the generator was reverted to the legacy
  `prisma-client-js`, and the config file was misnamed so the CLI never picked it up. Fixed both:
  - `schema.prisma`: generator provider `prisma-client-js` → `prisma-client` (the v7 default),
    with the now-required explicit `output` path (`app/generated/prisma`); removed the
    `datasource.url` field (deprecated in v7 — it now lives only in `prisma.config.ts`).
  - Renamed `prisma7.config.ts` → `prisma.config.ts` (the filename the Prisma CLI actually
    resolves).
  - Installed `@prisma/adapter-pg` + `pg` — v7 requires an explicit driver adapter for SQL
    providers instead of the old bundled engine.
- First migration attempt failed to reach Supabase: the direct-connection host
  (`db.<ref>.supabase.co`) only resolves to an IPv6 address, and there was no outbound IPv6 route.
  Switched `DATABASE_URL` to Supabase's session pooler (`aws-0-eu-central-1.pooler.supabase.com`,
  port 5432), which is IPv4.
- Second attempt still timed out — traced to Claude Code's own Bash sandbox blocking outbound
  traffic on non-web ports (confirmed: port 443 to the same host worked, 5432/6543/22 all timed
  out from inside the sandbox, everything worked fine from a normal terminal). Eri ran
  `npx prisma migrate dev --name init` directly in Terminal instead — succeeded, created all 6
  tables (`Project`, `DailyLog`, `LogMaterial`, `LogLabor`, `Material`, `LaborRole`).
- Ran `npx prisma generate` to produce the client at `app/generated/prisma` (didn't happen
  automatically as part of `migrate dev` this time — worth double-checking after future migrations).
- Installed the Supabase agent-skills package (`npx skills add supabase/agent-skills`) — adds
  "Supabase" and "Postgres Best Practices" skills for future DB/schema work.
- Verified `npm run dev` boots clean and serves `200` locally.

**Result:** Phase 0 minimum is done — real Postgres behind the schema, app runs, dev loop is
unblocked. Two commits, kept separate on request: the skills install, and the actual infra fixes.

**Open items / worth knowing:**
- Only one Supabase project exists (dev/prod share it for now, per `ARCHITECTURE.md` — split
  later, before the real engineer uses it).
- Vercel connection, branch protection, and CI (`.github/workflows/ci.yml`) are still the
  "add when ready" half of Phase 0 — not done yet.
- Next up per `BUILD-PLAN.md`: `feature/app-shell`.

---

## 2026-09-08 — Phase 0 wrap-up, engineer screen design, Phase 1 replanned

**Branches:** `setup/context-files` (merged), `fix/docs-casing` (merged), `docs/review-workflow`
(merged), `docs/phase1-engineer-log` (merged) — no `feature/*` branches yet, still pre-code.

**Phase 0, finished:**
- Added `.github/workflows/ci.yml` (install → generate → build on PRs/pushes to `develop`/`main`).
  First push was rejected — the git token lacked the `workflow` scope GitHub requires for pushing
  workflow files; Eri added the scope and it went through.
- Eri connected Vercel and turned on branch protection for `main`/`develop` via the GitHub
  dashboard.
- Found `docs/*.MD` were tracked with uppercase extensions — harmless on macOS, would've silently
  broken on Linux (CI, Vercel) since `CLAUDE.md` references them lowercase. Renamed, merged as
  `fix/docs-casing`.
- Merged `setup/context-files` into `develop` — CI ran for the first time (green) on both the PR
  and the merge push. Phase 0 is now fully done and proven end-to-end.

**Design — UI showcase (not yet in git, see below):**
- Explored the engineer/PM/owner screens as a multi-artboard canvas (Claude Design), published at
  https://claude.ai/code/artifact/debbee81-ad2e-4e1f-9ba7-9a579d0fdc45 — working source lives in
  `docs/design/showcase/`.
- Eri brought a second, independently-made mockup (`docs/design/siterack-ui-suggestion/`) — a
  pitch-deck-style document (pricing tiers, onboarding, tech pitch) rather than a UI spec; useful
  for its blue color direction and its finer engineer-flow screen breakdown, but its
  multi-tenant/SaaS framing doesn't match the one-pilot scope in `CONTEXT.md`.
- Talked through the actual engineer workflow: single project (no picker screen needed), no real
  login for the pilot, logging *usage* (not incoming deliveries) is the in-scope problem.
  Repositioned the "material log" screens as one combined "today's log" screen instead — first
  built materials-only, then corrected after Eri flagged it didn't show how the day comes together.
- Separately, picked the color direction: Eri's blue (`#2563EB`) over the original warm-amber
  draft — applied to the engineer screens.
- Sketched 3 structural directions for the combined screen (stacked sections / tabs with a shared
  totals bar / one chronological list). Eri picked **Idea B — tabs + shared totals bar**
  (`DayIdeaB.dc.html`); the other two sketches were removed from the canvas and repo once decided.
- Established a working rhythm this session: discuss in words first, only build when explicitly
  asked, verify each canvas update with a background re-check pass (arithmetic, layout rules,
  Albanian phrasing) before handing it back.

**Process convention added to `CLAUDE.md`:** UI pass (hardcoded data, reviewed by running the app)
then a separate wiring pass (connects to Supabase) — Eri reviews by using the running app, not by
reading diffs.

**`BUILD-PLAN.md` Phase 1 reworked** to match what got settled above:
- `feature/projects-list` dropped (no picker needed for one project).
- New `feature/engineer-daily-log-ui` replaces the old material/labor UI branches — builds the
  combined tabs+totals screen from `DayIdeaB.dc.html`, hardcoded, no DB.
- Persistence split into `feature/seed-and-persist` (materials) and new `feature/labor-persist`
  (labor) — small wiring-only branches per the new convention.
- Fixed stale `src/lib`/`src/actions` path references (repo has no `src/`).

**Result:** Phase 0 fully done and merged. Direction for the engineer's first real screen is
settled (phone). Plan is written up and ready to execute — nothing implemented in `app/` yet.

**Open items / worth knowing:**
- `docs/design/` (the whole showcase folder, both mockups) is **not committed** — still local
  working files. Decide whether/when it's worth putting in git.
- The combined daily-log screen's **web/desktop layout isn't designed yet** — only the
  materials-only version was (`MaterialLogWeb.dc.html`).
- Pushing straight to `develop` (used to merge these doc branches) wasn't blocked by branch
  protection — worth checking the GitHub settings if PRs should be strictly required, even for
  the repo owner.
- Next up: `feature/app-shell`, then `feature/engineer-daily-log-ui`.
