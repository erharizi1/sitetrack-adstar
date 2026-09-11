# SMTP

**In a nutshell:** SMTP (Simple Mail Transfer Protocol) is the standard way a program hands an
email to a mail server so it gets delivered. It's the "post office". Your email app uses it
every time you press Send.

## Where it shows up for us

Our login and invites are emails, so we need a post office. One Gmail account (with an app
password) delivers both, handed two different ways:

- **Login links:** Supabase writes the email (its Magic link template, with the secret link) and
  hands it to Gmail. Set up in Supabase → Authentication → Emails → SMTP Settings.
- **Invites:** our app writes the email itself (`lib/invite-email.ts`) and hands it to Gmail
  (`lib/email.ts`); Supabase only makes the secret link. Set up in Vercel as `SMTP_USER` and
  `SMTP_PASSWORD`. Why: Supabase kept sending its English default for invites, whatever template
  we saved, so the app took that one email over.

Connecting to a post office always takes the same things: host (`smtp.gmail.com`), port (`587`),
username, password, and the sender address and name.

## Why we couldn't use Supabase's built-in one

Supabase has a small built-in sender, meant only for trying things out:

- It sends about 2 emails an hour.
- It only delivers to members of the Supabase project team, so an invite to a technician would
  never arrive.
- On free projects created after 2026-06-03, you can't edit the email templates while using it.
  We need to edit them (see [Supabase Auth settings](supabase-auth-settings.md)).

Connecting our own SMTP removed all three limits.

## Worth knowing

- **App password:** Gmail won't let a program log in with your normal password. Instead you
  create a separate 16-character "app password" (2-Step Verification has to be on). You can
  revoke it at any time without changing your real password.
- **Limits:** Gmail allows about 500 emails a day, plenty for the pilot. Supabase has its own
  limit on top of that (Authentication → Rate Limits).
- **Spam:** emails from a personal Gmail can land in spam. Later, a sender on a company domain
  (e.g. Brevo, Resend) looks more professional and is trusted more by inboxes.
- **Where it's set:** Supabase → Authentication → Emails → SMTP Settings.
