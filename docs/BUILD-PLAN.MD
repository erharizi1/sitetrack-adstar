# SiteTrack Albania — Build Plan
 
Pairs with `CONTEXT.md` (why/what) and `ARCHITECTURE.md` (how it's put together). This file is the
*what to build next*: the feature branches in order, each with a paste-ready Claude Code prompt.
 
**Method for every branch:** branch off `develop` (`feature/<name>`) → describe the one feature to
Claude Code → review the diffs → run locally → commit + push → ask Claude Code to log it to
`docs/worklog.md` → open a PR into `develop` → merge → delete the branch. One feature at a time.
 
Where we are now: repo + Next.js scaffold exist, Prisma installed, context files in `docs/`,
working on the `develop` branch. Next up is Phase 0.
 
---
 
## Phase 0 — Infrastructure & workflow
 
Do the minimum to develop and push, then add the safety rails when you want them. Not feature
branches — this is setup.
 
**The minimum (unblocks development):**
1. Create the Supabase project (`sitetrack-adstar-dev`, Frankfurt) → get the connection string + URL + anon key.
2. Add `.env.local` with `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (confirm it's gitignored).
3. `npx prisma migrate dev --name init` → creates the 6 tables.
4. `npm run dev` → confirm the app loads at localhost:3000.
5. Commit + push. You're now in the develop-and-push loop.
**Add when ready (not blocking):**
- Vercel: connect the repo → `develop` auto-deploys a preview URL (test on your phone).
- Branch protection on `main` and `develop` (require PR + approval).
- GitHub Actions CI (`.github/workflows/ci.yml`): install · lint · build on every PR.
Details and diagrams for all of this live in `ARCHITECTURE.md`.
 
---
 
## Phase 1 — Site engineer daily tool
 
Goal: the engineer opens the app, picks the project, records a day's materials and labor with a
live running cost, and submits it. Persisted. This is the heart of the product.
 
1. **`feature/app-shell`** — layout, the `(engineer)` and `(pm)` route groups, basic nav, Albanian
   labels wired through `lib/labels.ts`. Everything hardcoded. A skeleton that runs.
   > "Read CLAUDE.md. Build the app shell: root layout + two route groups, (engineer) and (pm),
   > each with a placeholder page. Pull UI strings from src/lib/labels.ts in Albanian. No database yet."
2. **`feature/projects-list`** — engineer landing: a `ProjectCard` (name, budget, progress bar).
   One hardcoded project matching the real pilot. Mobile-first.
   > "Build the engineer projects list at (engineer)/page.tsx using a ProjectCard component
   > (name, total budget, progress bar). Hardcode one project. Mobile-first."
3. **`feature/material-log`** — the add-material form: pick from a preset list, enter quantity,
   auto-calc line cost, running total. All cost math in `lib/cost.ts`. Still hardcoded, no DB write —
   get the UX right first.
   > "Build MaterialForm: pick a material from a preset list, enter quantity, show line cost and a
   > running total. Put ALL cost calculation in src/lib/cost.ts. Hardcode the preset list."
4. **`feature/seed-and-persist`** — write `prisma/seed.ts` (real project + Material + LaborRole
   catalogs), run it, then wire the material log to save via a server action (`DailyLog` +
   `LogMaterial`). Data now survives a refresh.
   > "Write prisma/seed.ts inserting one Project with its Material and LaborRole catalogs. Add a
   > createDailyLog server action (src/actions/) that saves the DailyLog and its LogMaterial rows via
   > Prisma, and connect MaterialForm to it."
5. **`feature/labor-log`** — labor form (role preset, workers × hours × rate, overtime at 1.5×),
   persist `LogLabor`, fold labor into the running total.
   > "Add LaborForm (pick role from LaborRole preset, worker count, hours, auto-calc with overtime
   > at overtimeMultiplier). Save LogLabor rows and include labor in the day's total."
6. **`feature/submit-log`** — submit button moving the log `draft` → `submitted`, with a
   `LogStatusBadge`. The engineer's daily flow is complete.
   > "Add a submit action setting DailyLog status to submitted and stamping submittedAt. Show status
   > with a LogStatusBadge component."
---
 
## Phase 2 — PM dashboard
 
Goal: the PM sees where money is going against budget, across projects, and approves what the
engineer submitted.
 
7. **`feature/pm-dashboard`** — PM dashboard reading from the DB: budget vs actual, today's cost,
   list of daily logs with status. Desktop layout.
   > "Build (pm)/dashboard/page.tsx: read the project's daily logs, show budget vs actual, today's
   > cost, and a list of logs with status. Desktop layout."
8. **`feature/pm-approve`** — PM approves/rejects a submitted log (status → approved/rejected,
   optional manager note, stamp `approvedAt`).
   > "Add approve and reject server actions on a DailyLog (set status, managerNotes, approvedAt) and
   > buttons on the dashboard."
9. **`feature/budget-alerts`** — flag overruns: mark days/logs crossing a threshold of the daily or
   cumulative budget. The "know before it's too late" promise.
   > "Add budget-alert logic in src/lib/cost.ts that flags when a day's cost or the running total
   > crosses a configurable threshold, and surface the flag on the PM dashboard."
**→ Working pilot reached here.** Engineer logs, PM sees + approves + gets warned. Put it in front
of the real engineer for the 2-week "uses it daily without complaint" test.
 
---
 
## Phase 3 — Owner overview (sketch)
 
Goal: the owner (the dad) sees a high-level cross-project picture and can comment. Detail this once
Phase 2 is proven. Likely branches: `feature/owner-overview` (read-only cross-project summary),
`feature/owner-comments`.
 
---
 
## Phase 4 — AI layer + richer capture (sketch)
 
The direction, not near-term. The always-on assistant every user can talk to; capture beyond manual
material entry (variable costs, invoices, receipt photos, voice-reported issues + blockages). Also
the polish that makes it stick: `feature/photo-upload` (receipt photos via Supabase Storage — also
the first step toward capture), `feature/offline` (service worker + IndexedDB for poor signal),
`feature/realtime` (live PM dashboard).
 
**Open decision (Phase 4):** manual-first vs. capture-first. The pilot proves the manual loop; decide
consciously whether/how auto-capture replaces typing once you've watched the real engineer use it.
The 6-table schema supports both, so this isn't blocked by anything built earlier.
 
---
 
## Parallel task (Moisés)
Get the real pilot data from the client for `prisma/seed.ts`, needed by branch 4: project name +
budget, the material price list (name, unit, cost), and the labor roles + hourly rates. Gathering
this while Phase 1 branches 1–3 are built means it's ready when persistence lands.