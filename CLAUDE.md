@AGENTS.md
@docs/CONTEXT.md


## How we develop with an LLM

The method is as much the point as the product. Core loop:

- **One feature = one branch.** Branch off `develop` (`feature/<name>`), build the one thing,
  review it, merge back. Never build several features at once, never code on `develop` or `main`
  directly.
- **Steer, don't type.** Describe the feature to Claude Code — often out loud — from the UI or
  intent ("set up the site engineer screen"). It proposes the code; Eri reviews every change
  before it lands. We move by directing the LLM, not writing every line.
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