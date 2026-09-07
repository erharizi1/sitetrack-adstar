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
