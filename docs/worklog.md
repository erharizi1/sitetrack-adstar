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

---

## 2026-09-10 — First real code: app shell + the engineer's daily-log screen

**Branches:** `feature/app-shell` (merged, PR #3), `feature/engineer-daily-log` (this PR). Phase 1
of `BUILD-PLAN.md` is now both of its branches.

**Goal:** turn the settled design (`docs/design/showcase/DayIdeaB.dc.html`) into a working screen
the engineer can actually use — log materials and labor, see the day's cost, submit it.

**`feature/app-shell`:**
- Two route groups: `(engineer)` serves `/` (the engineer lands straight on today's log — no
  project picker, per `docs/decisions/log.md`) and `(pm)` serves `/dashboard` (placeholder).
- `lib/labels.ts` holds every user-facing string in Albanian, so wording can be corrected in one
  place.
- The blue palette from the design lives in `app/globals.css` as Tailwind theme tokens
  (`bg-surface`, `text-ink-muted`, `bg-accent`, …).
- Root layout: `lang="sq"`, create-next-app boilerplate and Geist font removed.

**`feature/engineer-daily-log`:**
- The screen (`app/(engineer)/_components/`): Materiale / Fuqi punëtore tabs, an add-flow per tab
  (bottom sheet on phone, centred panel from `sm:` up), and a sticky bar that always shows both
  subtotals plus the day's total — so the day reads as one thing even while one tab is open.
- `lib/cost.ts` — all cost arithmetic and Lek formatting in one place.
- `actions/daily-log.ts` — server actions to add/remove material and labor lines and submit the
  day. The `DailyLog` row is created on the first add, so the engineer never has to "start" a
  day; the stored total is re-summed from the saved lines after every change so it can't drift.
- Submitting moves the day `draft` → `submitted`; after that it's read-only with a status badge.
- `prisma/seed.ts` (`npm run db:seed`) — one project with 6 materials and 4 labor roles.
  **Placeholder figures**, clearly marked; re-running it refreshes the catalogs rather than
  duplicating them.
- `npm run build` now runs `prisma generate` first — the generated client is gitignored and
  Vercel only runs the build script, so without this the deploy would fail on a missing import.

**How it went:**
- The sandbox can't reach the database (same port block as Phase 0), so Eri ran the seed from his
  own terminal — it succeeded.
- Eri's first local run errored on the page's very first database query, with no reason in the
  message (the shape a connection failure usually has). After confirming the seed had landed,
  testing moved on; the cause wasn't pinned down.
- Process correction: earlier I'd pushed several doc changes straight to `develop`. Rule from here
  on: push feature branches only, Eri opens and merges the PR.

**Open items / worth knowing:**
- **Not yet verified end to end online.** Vercel needs `DATABASE_URL` set in its environment
  variables for the deployed page to reach Supabase.
- **Desktop layout deviates from the plan's note:** the add-flow is a centred panel on desktop,
  not the persistent side panel from `MaterialLogWeb.dc.html`. Needs its own design pass.
- **No authentication:** server actions are reachable by anyone who has the URL, and the engineer
  is a fixed name (`engineerName`), not an account. Fine for a pilot demo; not before real use.
- Overtime is supported in `lib/cost.ts` but not exposed in the labor add-flow yet.
- The session pooler (port 5432) has a small connection limit; serverless functions on Vercel may
  hit it under load — Supabase's transaction pooler is the usual fix if that shows up.
- Real client data (project, material prices, labor rates) still pending from Moisi.
- Next up per `BUILD-PLAN.md`: Phase 2, `feature/pm-dashboard`.

---

## 2026-09-10 — Roles renamed in code and docs (`feature/rename-roles`)

**Goal:** make the code say what the team now says — Owner / Engineer / Technician — before
building logins, so "engineer" never means two different people at once.

**What changed:**
- Route groups: `app/(engineer)/` → `app/(technician)/` (the on-site screen, still at `/`) and
  `app/(pm)/` → `app/(engineer)/` (the dashboard, still at `/dashboard`). No URL changed.
- `lib/labels.ts`: `labels.engineer` → `labels.technician`, `labels.pm` → `labels.engineer`; the
  nav labels are now "Tekniku" / "Inxhinieri", and the submit hint says the day goes to the
  engineer ("inxhinierit").
- `DailyLog.engineerName` → `technicianName` in code, mapped onto the existing `engineerName`
  column with `@map`. The placeholder name on new logs is now "Tekniku i kantierit" — replaced by
  the real logged-in name in `feature/login`.
- Docs: `CLAUDE.md`, `CONTEXT.md` (with a note on the three role names), `ARCHITECTURE.md` (the
  diagram), `BUILD-PLAN.md` (Phase 1/2 wording; the future branches are now
  `feature/engineer-dashboard` and `feature/engineer-approve`), `docs/README.md`. History — the
  worklog and past design explorations — left as written.

**How it went:** lint and build clean. Used `@map` instead of the migration the plan first
described: the dev and live app share one database, so a column rename would have broken the live
app until the merge deployed. This way the branch can merge at any time with nothing to run.

**Worth knowing:** the database column is still called `engineerName` — only the code name
changed.

---

## 2026-09-10 — Accounts and login by email link (`feature/login`)

**Goal:** real people with real accounts: each role lands on its own screen, and no page or
action works without the right role.

**What changed:**
- Two new tables: `Profile` (one per person who can log in — name, role, status; its id is their
  Supabase Auth user id) and `ProjectMember` (which projects they work on). The migration
  (`prisma/migrations/…_accounts/`) also turns on row-level security for every table.
- The login flow from `docs/design/final-designs/login/`: `/login` (email, "Dërgo linkun"),
  `/login/check` (the three steps, resend, change email) and `/login/expired`. Every email link
  lands on `/auth/confirm`, which verifies it and sends the person to their screen: technician →
  `/`, engineer and owner → `/dashboard`.
- `proxy.ts` (Next.js 16's name for middleware) refreshes the session on every request and sends
  anyone not logged in to `/login`.
- Every page checks the role (`requireRole`) and every server action refuses callers without it
  (`requireActionRole`). The daily-log actions also gained checks they were missing: a technician
  can only touch his own project's data, and a submitted day can no longer be edited.
- Each day's log now records the logged-in technician's name. The technician screen has a "Dil"
  (log out) button; the engineer area has the header from the invite design (brand, "Paneli",
  name, role, "Dil").
- `prisma/seed.ts` creates the Owner's account (plus optional test accounts) — nobody is above the
  Owner to invite them. `docs/email-templates/magic-link.html` is the login email for Supabase.

**How it went:**
- Built from Supabase's current docs and the installed package types rather than memory:
  `getClaims()` (which verifies the token) instead of `getSession()`, and email links that carry a
  `token_hash` verified on the server — so they work on any device, and work for invites, which
  have no "asking" device for the default PKCE flow to rely on.
- The login page never reveals whether an email has an account: it always goes on to "check your
  email".
- The migration was generated without a database connection (`prisma migrate diff` between the
  old and new schema), since the sandbox can't reach Postgres.
- Verified locally, logged out: `/` and `/dashboard` go to `/login`; the three screens render; a
  missing or bad link lands on "expired"; a link that lands on the site root is forwarded to
  `/auth/confirm`. A CI-style build with no Supabase variables compiles. **Not yet verified: a real
  login** — that needs the setup below.

**Open items / worth knowing:**
- **One-time setup before login works:** keys, redirect URLs, link lifetime (24 hours), the email
  template, `npx prisma migrate deploy`, and seeding the Owner — steps in `docs/README.md`
  ("One-time tooling setup").
- The "Dil" buttons aren't in the final designs — added because switching accounts needs them.
  Worth a look in the next design pass.
- Supabase's built-in email sender only sends a few emails an hour: fine for testing, not for real
  use.

---

## 2026-09-10 — Team page and invites (`feature/team-invite`)

**Goal:** let each role add the role below it — the owner adds engineers, an engineer adds
technicians — by email, with no passwords.

**What changed:**
- `/team` ("Ekipi" in the engineer header), from `docs/design/final-designs/invite/`: the people on
  your projects with their status (Aktiv / Në pritje / Çaktivizuar, and "U ftua … më parë" for
  pending invites), with the add form sliding in beside the list on desktop and as a bottom sheet
  on phone.
- `actions/team.ts`: invite, resend, deactivate, reactivate. The role always comes from who is
  adding; the project must be one the adder works on; you can only manage people exactly one role
  below you, on a project you share.
- Invites go through Supabase's `inviteUserByEmail`, using a secret-key client that only runs on
  the server (`lib/supabase/admin.ts`). Deactivating bans the Supabase login and marks the
  profile; since pages and actions check the status on every request, it takes effect at once.
- `Profile.invitedAt` (a small second migration) for "U ftua … më parë".
- `docs/email-templates/invite.html` — the invite email from the design: who invited you, to which
  project, in what role.
- `lib/site.ts` — the site's own address, now shared by the login and invite emails.

**How it went:**
- Supabase's auth server source showed it won't re-send an invite to an address whose first one
  is still pending: the call succeeds but sends nothing. So "Dërgo sërish" replaces the pending
  login — delete it, invite again, and move the profile to the new id (its project links follow
  through the foreign key's ON UPDATE CASCADE).
- Verified: lint, build, a CI-style build without Supabase variables, and `/team` sending
  logged-out visitors to `/login`. **Not yet verified: a real invite** — that needs the setup,
  including the Invite email template.

**Open items / worth knowing:**
- On phone, each person's action (resend / deactivate / reactivate) sits on their row; the design
  had it behind a tap on the person. Simpler for now — worth a design pass.
- Reactivating someone who never accepted their invite marks them "Aktiv" although they've never
  logged in; they'd need a fresh invite. Rare, fine for the pilot.
- The owner uses this same page (to add engineers) until the owner overview exists.
- Invites use Supabase's built-in email sender — a few per hour. Connect a real email service
  before inviting the actual team.

---

## 2026-09-11 — The app sends its own invite email (`feature/invite-email`)

**Goal:** make invites work. During the one-time setup, every invite arrived as Supabase's English
default email, and its link landed on "Ky link ka skaduar" — so the invited person never became
active.

**What we found on the way (the setup, in order):**
- New free Supabase projects (since 2026-06-03) lock the email templates while using Supabase's
  built-in sender, which also only emails the project's own team. So we connected a Gmail account
  over SMTP first — the first attempt failed with Gmail's `535 Username and Password not accepted`
  until an app password was used.
- With that, login by emailed link worked end to end: the Owner logged in and landed on /dashboard.
- Invites still came in English: the saved "Invite user" template was never applied, though the
  Magic link template on the same page was. Supabase falls back to its default silently, so we
  couldn't see why — and stopped depending on it.

**What changed:**
- `actions/team.ts`: invites (and "Dërgo sërish") now call Supabase's `generateLink`, which creates
  the login and the secret link but sends nothing. The app builds the `/auth/confirm` link from it
  and emails the invite itself; if the email fails, the new login is deleted again so nobody is
  left with an account they were never told about.
- `lib/invite-email.ts`: the invite email from `InviteEmail.dc.html`, in Albanian, with names and
  the project escaped (they're typed by people) and a plain-text copy.
- `lib/email.ts`: sends through the same Gmail account with `nodemailer` (pinned at 10.0.7), from
  `SMTP_USER` / `SMTP_PASSWORD`; host and port default to Gmail.
- `docs/email-templates/invite.html` removed — the email lives in code now. README setup,
  `docs/learning/` notes and this plan updated to match.

**How it went:**
- Verified: lint, build, and the email rendered with sample values (escaping, link, plain text).
  **Not yet verified: a real invite arriving** — that needs `SMTP_USER` / `SMTP_PASSWORD` in Vercel
  (done) and this branch deployed.

**Open items / worth knowing:**
- Login links still go through Supabase's Magic link template; only invites are ours.
- Emails from a personal Gmail can land in spam — a sender on the firm's own domain before the
  real team starts.
