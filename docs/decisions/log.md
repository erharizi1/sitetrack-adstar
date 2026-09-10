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

---

## 2026-09-10 — Three roles: Owner, Engineer, Technician

**Decision:** three kinds of user, each added only by the role above it:

| Role | Albanian | Does what | Added by |
|---|---|---|---|
| Owner | Pronar | owns the company, sees everything | set up once by us |
| Engineer | Inxhinier | responsible for a project | the Owner |
| Technician | Teknik | on site, logs the day's costs | an Engineer |

Nobody adds people at their own level. Whoever adds someone also picks their project(s), and can
deactivate them later. Engineers may get more admin tasks later (e.g. managing materials).

**Why:** Moisi saw the old names cause confusion in practice. What we called the "project manager"
is the **Engineer** now; what we called the "site engineer" is the **Technician**.

**Not done yet — rename pending:** the code and docs still use the old names. Until a dedicated
rename pass, "engineer" in the code (`app/(engineer)/`, `labels.engineer`, `DailyLog.engineerName`)
and in `CONTEXT.md` / `BUILD-PLAN.md` still means the **on-site person** — the opposite of the new
meaning. Do that rename in one go, on its own branch, before building logins.

---

## 2026-09-10 — Login by invite link, no passwords

**Decision:** the person above enters the new user's name and personal email; the new user gets an
email, clicks the link, and is registered, logged in and taken to their own main screen. No
password, no PIN or code, no Google/Microsoft sign-in. Logging in again later (new phone, logged
out): type your email, get a fresh link. Expired links get their own "ask for a new link" screen.

**Why:** simplest thing for someone on site — nothing to remember or type beyond an email — and it
matches the hierarchy above, where every account is created by someone. Chosen over the three
options on the login canvas (`docs/design/login/`: email + password, phone + SMS code, name + PIN).

**What it brings with it:** real user accounts, roles and project assignments in the database —
replacing the pilot's "names only, no users table" setup in `CONTEXT.md`. Supabase supports invite
links and email login out of the box, but its built-in email sender is for testing only (very low
sending limits), so real invites need a proper email service connected.
