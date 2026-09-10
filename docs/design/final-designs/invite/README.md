# Invite — final design

Chosen 2026-09-10 ("P2" on the canvas). How the person one role above adds someone — shown as an
Engineer adding a Technician; the Owner adds an Engineer the same way. Roles and the invite-link
login: `docs/decisions/log.md` (2026-09-10). Exploration: `docs/design/login/`. Canvas (page "Ftesa
(invite)"): https://claude.ai/code/artifact/c0362626-10fc-42e3-ac72-1698a4d344cd

| Screen | File |
|---|---|
| Team list with the add form sliding in beside it — desktop | `TeamPanel.dc.html` |
| The same on phone, with the form as a bottom sheet | `TeamPhone.dc.html` |
| The invite email the new person receives | `InviteEmail.dc.html` |

The list shows each person's status — Aktiv / Në pritje / Çaktivizuar — with resend and
deactivate on each row. The role comes from who is adding; the project is picked in the form.

**To build:** `feature/team-invite` in `docs/BUILD-PLAN.md`, after `feature/login`.

Names and emails are illustrative; Albanian copy still needs Moisi's check.
