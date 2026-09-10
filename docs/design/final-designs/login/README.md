# Login — final design

Chosen 2026-09-10. Login is by an emailed link, no password — see `docs/decisions/log.md`
(2026-09-10). Exploration: `docs/design/login/`. Canvas (page "Hyrja (login)"):
https://claude.ai/code/artifact/c0362626-10fc-42e3-ac72-1698a4d344cd

| Step | Screen | File |
|---|---|---|
| 1 | Login — type your email, get a link | `Login.dc.html` |
| 2 | Check your email — three numbered steps | `CheckEmail.dc.html` |
| 3 | Expired link — ask for a new one | `LinkExpired.dc.html` |

A new person never sees these — the invite email and one click log them in. They're for later: a
new phone, or logged out. After the link, each person lands on their own main screen: the
technician on today's log, the engineer on the dashboard.

`Login.dc.html` is `Main.dc.html` in the exploration folder, renamed here for clarity.

**To build:** `feature/login` in `docs/BUILD-PLAN.md`, after `feature/rename-roles`.

Names and emails are illustrative; Albanian copy still needs Moisi's check.
