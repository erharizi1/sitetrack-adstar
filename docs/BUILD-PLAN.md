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
 
Goal: the engineer opens the app and lands directly on **today's log** for the one active
project — no project picker, since the pilot is one project at a time. Materials and labor are
tabs on the same screen, with a shared bar showing both subtotals and the day's total, and a
submit button. Persisted. This is the heart of the product.

Design direction settled in `docs/design/showcase/` (canvas: see the link in that folder's
`README.md`) — `DayIdeaB.dc.html` is the chosen screen (tabs + shared totals bar), picked over
two alternatives (stacked sections, one unified list) after comparing all three. Phone layout is
settled; the web/desktop layout for this combined screen hasn't been designed yet — only the
earlier materials-only web split-panel (`MaterialLogWeb.dc.html`) exists as a reference for the
"persistent panel instead of a modal" responsive principle to extend.

Each branch below follows the UI-pass/wiring-pass convention from `CLAUDE.md`: build the screen
with hardcoded data first, review it running, *then* wire it to the database in a separate branch.
 
1. **`feature/app-shell`** — layout, the `(engineer)` and `(pm)` route groups, basic nav, Albanian
   labels wired through `lib/labels.ts`. Everything hardcoded. A skeleton that runs.
   > "Read CLAUDE.md. Build the app shell: root layout + two route groups, (engineer) and (pm),
   > each with a placeholder page. Pull UI strings from lib/labels.ts in Albanian. No database yet."
2. **`feature/engineer-daily-log-ui`** — the engineer's home screen: tabs for Materiale and Fuqi
   punëtore, each with an add-flow (bottom sheet on phone) to pick a preset, set quantity, see the
   line cost; a shared bottom bar with both subtotals and the day total; a submit button. All
   hardcoded (one project, preset material/labor lists), no database, no submit logic yet — get
   the UX right first. Mobile-first, matching `docs/design/showcase/DayIdeaB.dc.html`; extend
   responsively for web using the persistent-panel principle from `MaterialLogWeb.dc.html`,
   flagging anything that needs its own design pass.
   > "Build the engineer's daily-log screen at (engineer)/page.tsx: tabs for Materiale and Fuqi
   > punëtore. Each tab shows its logged line items with an add-flow (bottom sheet on phone) to
   > pick a preset from a hardcoded list, set a quantity, and see the computed line cost. A shared
   > bottom bar always shows the materials subtotal, the labor subtotal, and the combined day
   > total. Submit button below (no action wired yet). Match
   > docs/design/showcase/DayIdeaB.dc.html for the phone layout. All cost math in `lib/cost.ts`.
   > Hardcode one project and the preset material/labor lists. No database yet."
3. **`feature/seed-and-persist`** — write `prisma/seed.ts` (real project + Material + LaborRole
   catalogs), run it, then wire the Materiale tab to save via a server action (`DailyLog` +
   `LogMaterial`). Data now survives a refresh.
   > "Write prisma/seed.ts inserting one Project with its Material and LaborRole catalogs. Add a
   > createDailyLog server action (actions/) that saves the DailyLog and its LogMaterial rows via
   > Prisma, and connect the Materiale tab's add-flow to it."
4. **`feature/labor-persist`** — wire the Fuqi punëtore tab to save via a server action
   (`LogLabor`, workers × hours × rate, overtime at `overtimeMultiplier`), fold labor into the
   persisted day total. The UI already exists from branch 2 — this is wiring only.
   > "Add a server action saving LogLabor rows (role from LaborRole preset, worker count, hours,
   > auto-calc with overtime at overtimeMultiplier) via Prisma, and connect the Fuqi punëtore
   > tab's add-flow to it. Include labor in the persisted day total."
5. **`feature/submit-log`** — submit button moving the log `draft` → `submitted`, with a
   `LogStatusBadge`. The engineer's daily flow is complete.
   > "Add a submit action setting DailyLog status to submitted and stamping submittedAt. Show status
   > with a LogStatusBadge component."

**Dropped for the pilot:** a `feature/projects-list` engineer-facing picker screen — not needed
while there's only one project. Revisit if/when one engineer needs to switch between several.
 
---
 
## Phase 2 — PM dashboard
 
Goal: the PM sees where money is going against budget, across projects, and approves what the
engineer submitted.
 
6. **`feature/pm-dashboard`** — PM dashboard reading from the DB: budget vs actual, today's cost,
   list of daily logs with status. Desktop layout.
   > "Build (pm)/dashboard/page.tsx: read the project's daily logs, show budget vs actual, today's
   > cost, and a list of logs with status. Desktop layout."
7. **`feature/pm-approve`** — PM approves/rejects a submitted log (status → approved/rejected,
   optional manager note, stamp `approvedAt`).
   > "Add approve and reject server actions on a DailyLog (set status, managerNotes, approvedAt) and
   > buttons on the dashboard."
8. **`feature/budget-alerts`** — flag overruns: mark days/logs crossing a threshold of the daily or
   cumulative budget. The "know before it's too late" promise.
   > "Add budget-alert logic in lib/cost.ts that flags when a day's cost or the running total
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
Get the real pilot data from the client for `prisma/seed.ts`, needed by branch 3: project name +
budget, the material price list (name, unit, cost), and the labor roles + hourly rates. Gathering
this while Phase 1 branches 1–2 are built means it's ready when persistence lands.