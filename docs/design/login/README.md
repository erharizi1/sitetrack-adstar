# Login & invite — design

Source for the login and invite designs. The `.dc.html` files only render through the canvas
editor; to see the designs, open the published canvas (three pages — switch with the page name
in the toolbar):

**Live canvas:** https://claude.ai/code/artifact/c0362626-10fc-42e3-ac72-1698a4d344cd

Decided (details and reasoning in `docs/decisions/log.md`, 2026-09-10): login by **invite link**,
no password; three roles — **Owner / Engineer / Technician** (Pronar / Inxhinier / Teknik), each
added by the role above.

## Page 1 — Hyrja (login) — **chosen**

A new person never sees these: the invite email and one click log them in. These screens are for
later — new phone, or logged out.

| Step | Screen | File |
|---|---|---|
| 1 | Login — type your email, get a link | `Main.dc.html` |
| 2 | Check your email — three numbered steps | `CheckEmail.dc.html` |
| 3 | Expired link — ask for a new one | `LinkExpired.dc.html` |

Tapping the link in the email lands each person on their own main screen: the technician on
today's log, the engineer on the dashboard.

## Page 2 — Ftesa (invite) — **chosen**

Shown as an Engineer adding a Technician; the Owner adds an Engineer the same way.

| Screen | File |
|---|---|
| Team list with the add form sliding in beside it — desktop | `TeamPanel.dc.html` |
| The same on phone, with the form as a bottom sheet | `TeamPhone.dc.html` |
| The invite email the new person receives | `InviteEmail.dc.html` |

The list shows each person's status — Aktiv / Në pritje / Çaktivizuar — with resend and
deactivate on each row.

## Page 3 — not chosen

Kept for the record:
- First round — email + password (`LoginAPhone.dc.html`, `LoginADesktop.dc.html`), phone + SMS code
  (`LoginBPhone.dc.html`, `LoginBDesktop.dc.html`), name + PIN (`LoginCPhone.dc.html`,
  `LoginCDesktop.dc.html`).
- Second round — D1's check-your-email (`D1Check.dc.html`), D2 "Site (bold)" (`D2Login.dc.html`,
  `D2Check.dc.html`), D3's login (`D3Login.dc.html`), D3's original check-your-email with the
  progress strip (`D3Check.dc.html`).
- The full-page invite form (`InviteFormPage.dc.html`).

## Status

**Login and invite: both chosen.** Names, emails and figures are illustrative; Albanian copy still
needs Moisi's check.
