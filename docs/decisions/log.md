# Decisions log

The durable "why" behind choices that aren't obvious from the code or the worklog's story —
short entries, added as decisions get made. Pairs with `git log` (*what* changed) and
`docs/worklog.md` (*the story* of what got built).

---

## 2026-09-08 — No project-picker screen for the engineer

**Decision:** the engineer opens the app and lands directly on today's log for the one active
project. No landing/list screen to choose a project.

**Why:** the pilot is one project at a time — a picker would just add a tap with nothing to
actually pick. Revisit if/when one engineer needs to switch between multiple active projects.

---

## 2026-09-08 — Logging usage, not deliveries

**Decision:** v1 logs what materials are *used* (the cost driver), not what *arrives* on site as
a separate delivery/receiving event.

**Why:** `CONTEXT.md`'s stated problem is cost tracking specifically — usage is what drives cost.
Tracking incoming deliveries as their own event is a real thing on site, but a different problem,
not needed to solve cost tracking. The schema doesn't block adding it later.

---

## 2026-09-08 — One branch per whole screen, not per build-pass

**Decision:** a screen (UI + its persistence) ships as a single branch/PR/deploy. Build order
inside that branch still goes UI-with-hardcoded-data first, then wiring — but that's an internal
sequence, not separate branches to review and merge one at a time.

**Why:** started as UI-pass/wiring-pass split into separate branches (smaller diffs, isolates
"looks wrong" bugs from "doesn't save" bugs). Reversed after finding it added review overhead
without matching how Eri actually wants to check work — by running the finished, functional
screen, not by reviewing intermediate steps separately.
