# Supabase Auth settings

**In a nutshell:** Supabase sends our login emails, so a few things live in its dashboard, not
in our code: where links may point, what the emails say, and how long links last. The
step-by-step setup is in `docs/README.md`; this note is the *why*.

## URL Configuration: where links are allowed to send people

*Authentication → URL Configuration*

When the app asks for a login link it says "after the click, bring them back to
`…/auth/confirm`". Supabase only obeys if that address is on an **allow-list**. Otherwise
someone could make a link that sends a person's login to their own website.

- **Site URL:** the main address, used when none is given (`https://sitetrack-adstar.vercel.app`).
- **Redirect URLs:** the allow-list. We list the live site and `http://localhost:3000` (for
  testing on a laptop). `/**` at the end means "any page under this address".

## Email templates: what the emails say

*Authentication → Emails → Templates*

- **Magic link:** the login email, the one template we use. Ours is
  `docs/email-templates/magic-link.html`: in Albanian, matching the design, and, most
  importantly, building the `token_hash` link our app understands (see
  [Login by email link](magic-link-login.md)).
- **Invite user:** not used. Supabase kept sending its English default for invites no matter
  what we saved, so the app sends the invite email itself (see [SMTP](smtp.md)).
- Templates fill in placeholders like `{{ .TokenHash }}` (the secret) and `{{ .RedirectTo }}`
  (the address the link goes back to).
- On new free projects the templates are locked until you connect your own [SMTP](smtp.md).
  That's why we set up Gmail first.

## Email OTP Expiration: how long a link lasts

*Authentication → Sign In / Providers → Email*

It's in seconds: `86400` = 24 hours. The default is 1 hour, too short for someone who opens the
invite the next morning. ("OTP" = one-time password; Supabase uses the same setting for links.)

## Keys: the two kinds

*Project Settings → API Keys*

- **Publishable key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`): safe to be in the browser; it
  can only do what a logged-out visitor may do.
- **Secret key** (`SUPABASE_SECRET_KEY`): full admin power (inviting, deactivating people).
  Server only. Anything named `NEXT_PUBLIC_…` is sent to the browser, so the secret key must
  never get that prefix.
