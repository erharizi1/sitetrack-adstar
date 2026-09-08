@AGENTS.md
@docs/CONTEXT.md

The build order lives in `docs/BUILD-PLAN.md` — read it when starting or picking a feature.
Read `docs/ARCHITECTURE.md` when working on infrastructure, deployment, or the data model.

## How we develop with an LLM

The method is as much the point as the product. Core loop:

- **One feature = one branch.** Branch off `develop` (`feature/<name>`), build the one thing,
  review it, merge back. Never build several features at once, never code on `develop` or `main`
  directly.
- **Steer, don't type.** Describe the feature to Claude Code — often out loud — from the UI or
  intent ("set up the site engineer screen"). It proposes the code; Eri reviews every change
  before it lands. We move by directing the LLM, not writing every line.
- **One branch per whole screen; UI first, then wiring, inside it — review by running, not
  reading.** Once a screen's design is settled, build the UI with hardcoded fake data first (so
  the look and flow can be checked immediately, before any backend exists), then wire it to
  Supabase via a Next.js server action — but land it all as one branch, one PR, one review, one
  deploy, not a separate branch per step. Hand it back as "here's what to click, here's what
  should happen" — Eri isn't fluent in Next.js and reviews by running the app and testing it
  through the UI, not by reading the diff line by line. Explaining code in plain terms is still
  welcome when something's worth knowing; it's just never the approval gate.
- **Test on `develop`, promote to `main`.** A finished feature is tested live on `develop` — on
  the phone (engineer view) and the desktop (PM view) at once. When a version is solid, it's
  pushed to `main` → production, which is what people on the actual site see.

We keep three layers of history, each answering a different question:

- `git log` — *what* changed, exactly (automatic, every commit).
- `docs/decisions/` — *why* we chose things (one short file per decision; rare, durable).
- `docs/worklog.md` — *the story* of what got built and the intent behind it (Claude Code writes
  an entry per feature, so either of us can later ask "what was this trying to achieve?").

Session start: Claude Code reads `CLAUDE.md`, which loads this context automatically. Give it one
feature at a time.