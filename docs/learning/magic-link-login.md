# Login by email link ("magic link")

**In a nutshell:** there's no password. You type your email, get a link, tap it, and you're in.
Opening the email proves the address is yours.

## The journey, step by step

1. **You ask for a link.** `/login` → you type your email → "Dërgo linkun"
   (`actions/auth.ts`, `sendLoginLink`). Only people who already have an account get one; the
   app never creates accounts from this screen.
2. **Supabase makes a one-time secret** (a *token*) and sends the email through our
   [SMTP](smtp.md). The link in the email looks like
   `https://sitetrack-adstar.vercel.app/auth/confirm?token_hash=…&type=email`.
3. **You tap it.** The app's `/auth/confirm` page (`app/auth/confirm/route.ts`) asks Supabase
   "is this token real and still fresh?" If it is, Supabase hands back a *session*: a small
   signed ticket stored as a cookie in your browser.
4. **The app checks who you are in our own database** (the Profile table): if you're
   deactivated, you're out; if this is your first time through an invite, you're marked active.
   Then it sends you to your screen (the technician to `/`, everyone else to `/dashboard`).
5. **From then on,** every page load checks the cookie (`proxy.ts`). No cookie → back to `/login`.

## Why our link has a `token_hash` (and not the default `code`)

Supabase can build the link in two ways:

| | Default ("code", called PKCE) | Ours (`token_hash`) |
|---|---|---|
| How it's checked | Needs a secret the *browser that asked* kept | Checked by our server alone |
| Ask on phone, open on laptop | ❌ fails | ✅ works |
| Invites (nobody "asked") | ❌ doesn't work | ✅ works |

A technician might ask for the link on their phone and open the email somewhere else, and invites
have no "asking" browser at all. So we use `token_hash`. That's why the email template has to
be ours: the default template builds the other kind of link, and our app would show
"Ky link ka skaduar".

## Worth knowing

- **One use only.** A link works once; tapping it again shows the expired screen.
- **Lifetime.** A link lasts as long as "Email OTP Expiration" says (we set 24 hours).
- **Invites are the same mechanism** with `type=invite`: the first tap logs the person in.
- **Why not passwords?** Nothing to forget or reset, and site workers already live in their
  inbox or phone. See `docs/decisions/log.md`, "Login by invite link".
