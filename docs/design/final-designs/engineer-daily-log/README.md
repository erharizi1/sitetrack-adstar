# Engineer daily log — final design

The on-site person's main screen: today's log. It was built as the "site engineer" screen; that role
is now called the **Technician** (see `docs/decisions/log.md`, 2026-09-10).

Chosen 2026-09-08 — "Idea B" of three structures compared in the first design session.
Exploration: `docs/design/showcase/`. Canvas (page "Dita e Sotme"):
https://claude.ai/code/artifact/debbee81-ad2e-4e1f-9ba7-9a579d0fdc45

| Screen | File |
|---|---|
| Today's log — Materiale / Fuqi punëtore tabs, a shared bar with both subtotals and the day's total, submit — phone | `DayIdeaB.dc.html` |

**Built:** `feature/engineer-daily-log` (PR #4), live at `/`.

**Gap:** the design is phone-only. On desktop, the built screen adds lines in a centred panel —
the desktop layout still needs its own design pass.
