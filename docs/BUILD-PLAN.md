# SiteTrack Albania — Build Plan
 
Pairs with `CONTEXT.md` (why/what) and `ARCHITECTURE.md` (how it's put together). This file is the
*what to build next*: the feature branches in order, each with a paste-ready Claude Code prompt.
 
**Method for every branch:** branch off `develop` (`feature/<name>`) → describe the one feature to
Claude Code → review the diffs → run locally → commit + push → ask Claude Code to log it to
`docs/worklog.md` → open a PR into `develop` → merge → delete the branch. One feature at a time.
 
Where we are now: Phase 0 and Phase 1 are done and merged. The designs decided so far are in
`docs/design/final-designs/`. Phase 1.5 (accounts: rename, login, team invites) is built and in
review; after it, Phase 2.
 
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
 
## Phase 1 — Technician daily tool
 
Goal: the technician opens the app and lands directly on **today's log** for the one active
project — no project picker, since the pilot is one project at a time. Materials and labor are
tabs on the same screen, with a shared bar showing both subtotals and the day's total, and a
submit button. Persisted. This is the heart of the product.

Design direction settled in `docs/design/showcase/` (canvas: see the link in that folder's
`README.md`) — `DayIdeaB.dc.html` is the chosen screen (tabs + shared totals bar), picked over
two alternatives (stacked sections, one unified list) after comparing all three. Phone layout is
settled; the web/desktop layout for this combined screen hasn't been designed yet — only the
earlier materials-only web split-panel (`MaterialLogWeb.dc.html`) exists as a reference for the
"persistent panel instead of a modal" responsive principle to extend.

One branch per whole screen — build order inside the branch still goes UI (hardcoded data) first,
then wiring, per `CLAUDE.md`, but it all lands as a single PR/review/deploy instead of separate
branches per step.
 
1. **`feature/app-shell`** — layout, the `(engineer)` and `(pm)` route groups, basic nav, Albanian
   labels wired through `lib/labels.ts`. Everything hardcoded. A skeleton that runs.
   > "Read CLAUDE.md. Build the app shell: root layout + two route groups, (engineer) and (pm),
   > each with a placeholder page. Pull UI strings from lib/labels.ts in Albanian. No database yet."
2. **`feature/engineer-daily-log`** — the whole engineer screen, UI through persistence: tabs for
   Materiale and Fuqi punëtore, each with an add-flow (bottom sheet on phone) to pick a preset,
   set quantity, see the line cost; a shared bottom bar with both subtotals and the day total; a
   submit button. Mobile-first, matching `docs/design/showcase/DayIdeaB.dc.html`; extend
   responsively for web using the persistent-panel principle from `MaterialLogWeb.dc.html`,
   flagging anything that needs its own design pass. Wired end to end: real `Project`/`Material`/
   `LaborRole` catalogs seeded, `DailyLog`/`LogMaterial`/`LogLabor` saved via server actions, submit
   moves status `draft` → `submitted` with a `LogStatusBadge`.
   > "Build the engineer's daily-log screen at (engineer)/page.tsx: tabs for Materiale and Fuqi
   > punëtore. Each tab shows its logged line items with an add-flow (bottom sheet on phone) to
   > pick a preset, set a quantity, and see the computed line cost. A shared bottom bar always
   > shows the materials subtotal, the labor subtotal, and the combined day total. Submit button
   > below. Match docs/design/showcase/DayIdeaB.dc.html for the phone layout. All cost math in
   > lib/cost.ts. Build the UI first with hardcoded data to get the interaction right, then wire
   > it up: write prisma/seed.ts inserting one Project with its Material and LaborRole catalogs,
   > add server actions (actions/) that create the DailyLog and save LogMaterial/LogLabor rows via
   > Prisma as they're added, and a submit action setting status to submitted and stamping
   > submittedAt."

**Dropped for the pilot:** a `feature/projects-list` technician-facing picker screen — not needed
while there's only one project. Revisit if/when one technician needs to switch between several.

**Done** — `feature/app-shell` (PR #3) and `feature/engineer-daily-log` (PR #4) are merged; the screen
is live at `/`. Final design: `docs/design/final-designs/engineer-daily-log/`.
 
---
 
## Phase 1.5 — Accounts: roles, login, team

Goal: real people with real accounts. Three roles — Owner, Engineer, Technician (Pronar /
Inxhinier / Teknik) — each added only by the role above, and everyone logs in with an emailed link,
no password. See `docs/decisions/log.md` (2026-09-10). Everything after this — the Engineer's
dashboard, approvals — needs to know who is logged in.

Designs: `docs/design/final-designs/login/` and `docs/design/final-designs/invite/`
(exploration and the options not picked: `docs/design/login/`).

3. **`feature/rename-roles`** — the code and docs still use the old names, and "engineer" in the
   code currently means the on-site person, the opposite of its new meaning. Rename everything in
   one go before any auth work, with no change in behaviour: route group `(engineer)` →
   `(technician)` and `(pm)` → `(engineer)` (URLs stay `/` and `/dashboard`), `labels.engineer` →
   `labels.technician`, `DailyLog.engineerName` → `technicianName` (mapped onto the existing column
   with `@map`, so no database migration), and the
   wording in `CONTEXT.md`, `ARCHITECTURE.md` and this file.
   > "Read docs/decisions/log.md (2026-09-10, three roles). Rename the roles across the code and
   > docs: the on-site person is now the Technician, the project lead is the Engineer. Rename
   > app/(engineer) to app/(technician) and app/(pm) to app/(engineer), labels.engineer to
   > labels.technician, and DailyLog.engineerName to technicianName (keep the column via @map, no
   > migration). Update
   > CONTEXT.md, ARCHITECTURE.md and BUILD-PLAN.md to the new names. No behaviour changes."
4. **`feature/login`** — accounts and login by emailed link: a profile table tied to Supabase Auth,
   holding each person's name, role and project(s); the three login screens from the final design;
   after the link, each role lands on its own screen (technician → `/`, engineer → `/dashboard`,
   the owner → `/dashboard` until the owner overview exists). Every page and server action requires
   a logged-in user with the right role — today they're open to anyone with the URL — and each
   day's log records the logged-in technician instead of the fixed name. One Owner account is
   seeded, since nobody is above the Owner to invite them. Supabase's built-in email is fine while
   building; real use needs a proper email service connected.
   > "Read docs/decisions/log.md (2026-09-10) and docs/design/final-designs/login/. Add accounts: a
   > profile table linked to Supabase Auth with name, role (owner / engineer / technician) and
   > project membership. Build the Login, CheckEmail and LinkExpired screens to match the final
   > designs, logging in with Supabase email links — no passwords. After the link, send technicians
   > to /, engineers and the owner to /dashboard. Protect every page and server action so nothing
   > works without a logged-in user of the right role, and record the logged-in technician on each
   > DailyLog instead of the fixed name. Seed one Owner account. Use Supabase's built-in email for
   > now."
   **Built.** Before it works it needs a one-time setup — keys, redirect URLs, link lifetime, the
   email template, `npx prisma migrate deploy`, and seeding the Owner: see "One-time tooling
   setup" in `docs/README.md`.
5. **`feature/team-invite`** — the team page from the final design: the project's people with
   their status (Aktiv / Në pritje / Çaktivizuar), resend on pending invites, deactivate and
   reactivate, and the add form beside the list (a bottom sheet on phone). Sending it invites the
   person by email with a Supabase invite link; the role comes from who is inviting (an engineer
   adds technicians, the owner adds engineers — using this same page until the owner overview
   exists) and the project is picked in the form. The email follows `InviteEmail.dc.html`. Only
   the role directly above can add, resend or deactivate. Needs the proper email service in place
   first — Supabase's built-in sender only allows a few emails an hour.
   > "Read docs/decisions/log.md (2026-09-10) and docs/design/final-designs/invite/. Build the team
   > page at (engineer)/team: the project's people with their status (Aktiv / Në pritje /
   > Çaktivizuar), resend on pending invites, deactivate and reactivate on the rest, and an add form
   > in a side panel (a bottom sheet on phone). Sending the form invites the person by email with a
   > Supabase invite link; the role comes from who is inviting (engineer → technician, owner →
   > engineer) and the project is picked in the form. Use InviteEmail.dc.html for the email
   > template. Only the role directly above may add, resend or deactivate."
   **Built.** The invite email is now sent by the app itself (5a) — see "One-time tooling setup"
   in `docs/README.md`.

5a. **`feature/invite-email`** — found during the setup: Supabase kept sending its English default
   invite email whatever template was saved, and that email's link lands on "link expired". So the
   app sends the invite itself: Supabase's `generateLink` creates the login and the secret link
   without emailing, and the app emails our Albanian invite (the design's `InviteEmail.dc.html`)
   through the same Gmail account, read from `SMTP_USER` / `SMTP_PASSWORD`.
   > "Invites arrive with Supabase's English default template even though our Invite template is
   > saved. Stop depending on it: create the invite with auth.admin.generateLink (type invite),
   > build the /auth/confirm link from its hashed_token, and send our own Albanian invite email
   > (from InviteEmail.dc.html) over SMTP with nodemailer, reading SMTP_USER and SMTP_PASSWORD
   > (host and port default to Gmail). Resend must keep working."
   **Built.** Needs `SMTP_USER` and `SMTP_PASSWORD` in `.env` and in Vercel — see `docs/README.md`.
 
---
 
## Phase 2 — Engineer dashboard
 
Goal: the engineer sees where money is going against budget, across projects, and approves what
the technician submitted.
 
6. **`feature/engineer-dashboard`** — the engineer's dashboard, reading from the DB: budget vs actual, today's cost,
   list of daily logs with status. Desktop layout.
   > "Build (engineer)/dashboard/page.tsx: read the project's daily logs, show budget vs actual, today's
   > cost, and a list of logs with status. Desktop layout."
7. **`feature/engineer-approve`** — the engineer approves/rejects a submitted log (status → approved/rejected,
   optional manager note, stamp `approvedAt`).
   > "Add approve and reject server actions on a DailyLog (set status, managerNotes, approvedAt) and
   > buttons on the dashboard."
8. **`feature/budget-alerts`** — flag overruns: mark days/logs crossing a threshold of the daily or
   cumulative budget. The "know before it's too late" promise.
   > "Add budget-alert logic in lib/cost.ts that flags when a day's cost or the running total
   > crosses a configurable threshold, and surface the flag on the engineer dashboard."
**→ Working pilot reached here.** Technician logs, engineer sees + approves + gets warned. Put it in front
of the real technician for the 2-week "uses it daily without complaint" test.
 
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
`feature/realtime` (live engineer dashboard).
 
**Open decision (Phase 4):** manual-first vs. capture-first. The pilot proves the manual loop; decide
consciously whether/how auto-capture replaces typing once you've watched the real technician use it.
The 6-table schema supports both, so this isn't blocked by anything built earlier.
 
---
 
## Parallel task (Moisés)
Get the real pilot data from the client for `prisma/seed.ts`, needed by branch 2: project name +
budget, the material price list (name, unit, cost), and the labor roles + hourly rates. Gathering
this while Phase 1 branch 1 is built means it's ready when persistence lands.
