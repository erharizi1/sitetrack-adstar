# SiteTrack Albania — Project Context
 
> Hand-off brief for Claude Code. This is the current state of the project as of 2026-09-06,
> distilled from a long brainstorm (with another assistant) plus the founder's own decisions.
> Read this first, then ask before making architectural changes.
 
---
 
 ## Problem we're solving

Mid-size Albanian construction firms track project costs on paper, Excel, and phone calls.
As a pilot, we have a concrete use case: the father of a friend runs a construction company,
and we're working directly with his business to develop a real solution around it.

Three problems come out of it:

- **Cost tracking is unreliable.** Some tracking already happens, but it lives in disconnected
  places, isn't tied to anything, and can't be seen in real time. By the time the numbers are
  pulled together, the moment to act has passed.
- **No overview across projects.** The firm runs several projects at once, each at a different
  stage, with no single place to see how any of them is doing.
- **The site engineer loses time.** Compiling costs by hand daily is slow and eats into the
  hours he should spend running the site.

The main problem we're solving first is cost tracking. We're still figuring out how this really
works on the ground, so this project is an attempt to develop a *mechanism* for keeping track of
cost — not a finished answer. We're starting with the simplest version: the site engineer logs
everything manually. That's a deliberate starting point, and it may change as we learn what
actually fits the reality of the site.

---

## Product vision

Three people use the product, each with their own view:

- **Site engineer — the daily tool.** Easy to interact with, built around his real needs on
  site. It starts with logging materials, but the bigger picture is tracking *all* the cost
  that happens on the ground: multiple and variable cost types, invoices, and so on. He can
  also report beyond cost — flag issues or blockages as they come up (potentially by voice),
  so nothing that happens on site stays invisible.
- **Project manager — the dashboard.** Everything the engineer reports flows here. A PM may
  run several projects at once and needs to see each at a glance — not just cost, but open
  issues and blockages too. When something happens on a site, the PM knows.
- **Owner (the dad) — the overview.** A high-level picture across all projects, informed by
  what the app surfaces, with the ability to leave comments.

Running underneath all three: an AI layer. Every user can talk to it, and it's always working
in the background to help — surfacing what matters, not just answering when asked.

This is the full vision. We start basic — manual logging, the core cost loop — and grow toward
it over time. Nothing here is the first build; it's the direction the first build points at.


## Tools used

- **Next.js 15 + TypeScript** — the framework the whole app is built in. One codebase serves
  both the engineer's phone view and the PM's desktop view. TypeScript catches mistakes as you type.
- **Tailwind CSS + shadcn/ui** — how the app is styled. Tailwind for layout, shadcn for
  ready-made components (buttons, forms, cards) so we don't build them from scratch.
- **Supabase** — the cloud database (PostgreSQL). Where all logged cost data lives. Hosted, so
  there's no server to manage. Region: Frankfurt, closest to Albania.
- **Prisma** — the bridge between the app and the database. We describe the tables once in
  `schema.prisma`, and Prisma handles reading/writing them with type safety.
- **Zod + React Hook Form** — handle the forms the engineer fills in and validate the input
  (e.g. a quantity must be a positive number) before it's saved.
- **GitHub** — stores the code and all branches. The single source of truth for the project.
- **Vercel** — where the app runs live on the internet. Watches GitHub and auto-deploys: push
  to `develop` → test URL, push to `main` → production URL.
- **VS Code + Claude Code** — the development environment. VS Code to edit and review; Claude
  Code (terminal) as the AI that writes and refactors, with every change reviewed before it lands.


## Roles

Two people build this, with a shared aim beyond the product itself: learn how to develop by
leveraging an LLM well.

- **Eri — engineering lead.** Experienced software engineer (~10 years), mostly backend with
  some frontend. Steers the direction, makes the technical calls, and does most of the building.
  Approaches this as a test of a working method: locate a real-world problem precisely, then use
  the LLM to move fast on it — and learn by steering rather than typing every line.

- **Moisi — product owner & client bridge.** Finance background, not a coder (yet). His father runs the construction company the pilot is built for. Moisi gathers pain points and requests from the real users on site and converts them into product features he communicates to Eri. He tests each build, documents feedback, and owns the "does this fit reality" question. He may also steer some development himself — talking directly to Claude Code when he wants to.

How the LLM fits: treat it as the third member of the team. It writes and refactors code under
Eri's review, keeps the work story in `docs/worklog.md`, and lets both people move by directing
it — Eri on the technical side, Moisés able to follow what's being built without reading code.



## Product roadmap
 
We start basic and grow toward the vision. Rough phases (detail lives in `docs/BUILD-PLAN.md`):
 
- **Phase 0 — Infrastructure & workflow (now).** Cloud, database, two environments (`develop` and
  `main`/production), the branch model, and CI/CD — so development runs smoothly. This phase also
  sets how we build: one feature = one branch, tested live on phone + desktop, promoted to
  production when solid.
- **Phase 1 — Site engineer daily tool.** The engineer's screen: manual material logging → running
  cost → submit.
- **Phase 2 — PM dashboard.** Reported data flows to the PM: cost and budget-vs-actual per project,
  plus open issues and blockages across the several projects a PM runs.
- **Phase 3 — Owner overview.** High-level cross-project picture, with the ability to comment.
- **Phase 4 — AI layer + richer capture.** The always-on assistant every user can talk to; broader
  cost capture beyond materials (variable costs, invoices, voice-reported issues).
---
 
 
## 4. Data model (Prisma, 6 tables — pilot scope)

Source of truth: `prisma/schema.prisma` (read it for exact fields). In short:

A **Project** has many **DailyLogs** (one per day). Each DailyLog holds the day's **LogMaterials**
and **LogLabor** lines and rolls them into a total; the engineer submits it and the PM approves.
**Material** and **LaborRole** are per-project preset catalogs the engineer picks from instead of
typing. No users table yet (names only for the pilot); money is always `Decimal`.
 
---
 