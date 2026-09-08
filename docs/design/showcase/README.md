# UI showcase — source files

Working source for the first-pass UI mockups (engineer, PM, owner screens). These `.dc.html`
files aren't standalone pages — they're Design Component source that only renders through the
canvas editor tool. To see the actual mockups, use the published link:

**Live canvas:** https://claude.ai/code/artifact/debbee81-ad2e-4e1f-9ba7-9a579d0fdc45

| File | Screen |
|---|---|
| `Main.dc.html` | Engineer — projects list (mobile) |
| `DailyLog.dc.html` | Engineer — daily material/labor log entry (mobile) |
| `PMDashboard.dc.html` | PM — project dashboard (desktop) |
| `OwnerOverview.dc.html` | Owner — cross-project overview (desktop) |
| `MaterialLogPhone.dc.html` | Engineer — material log, phone |
| `MaterialLogPhoneSheet.dc.html` | Engineer — "add material" bottom sheet, phone |
| `MaterialLogWeb.dc.html` | Engineer — material log, web/desktop (persistent side panel instead of a sheet) |
| `DayIdeaB.dc.html` | Engineer — **"today's log" as one screen** (materials + labor tabs, shared totals bar), phone. Chosen direction after comparing 3 alternatives (A: stacked sections, C: unified chronological list — both dropped once B won). |
| `canvas.json` | Canvas layout — 3 pages: "Pasqyra e ekraneve" (first pass, all 3 roles), "Regjistrimi i Materialeve" (materials-only pass on `feature/material-log`), "Dita e Sotme" (the settled full-day direction) |

All data (project names, amounts, people) is illustrative — not real client data. Albanian
copy needs a native-speaker check before anything is built to match it word-for-word.

Status: **direction settled for the engineer's daily-log screen (phone)** — web version and the
rest of the flow (submit, PM/owner) still to work through. Not yet written up as a
`BUILD-PLAN.md` prompt.
