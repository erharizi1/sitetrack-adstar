This README is the front door — it tells you where to start and where everything lives.
 
---
 
## Start here
 
New to the project? Read these three, in order:
 
1. **`docs/CONTEXT.md`** — *why* this exists and *what* we're building: the problem, the product
   vision, the people, the roadmap. Start here.
2. **`docs/ARCHITECTURE.md`** — *how* it's put together: cloud setup, environments, CI/CD, and the
   data model. Diagrams included (open in VS Code preview with `Cmd+Shift+V`).
3. **`docs/BUILD-PLAN.md`** — *what to build next*: the features in order, each with a ready prompt.
If you're working *with* Claude Code, it reads `CLAUDE.md` automatically at the start of every
session, so it already knows the above.
 
---
 
## The files, and what each is for
 
| File | Answers | When to read it |
|---|---|---|
| `CLAUDE.md` | How we work — rules for Claude Code | Loaded automatically every session |
| `docs/CONTEXT.md` | Why & what we're building | First, to understand the project |
| `docs/ARCHITECTURE.md` | How the system is built | Working on infra, deploy, or the schema |
| `docs/BUILD-PLAN.md` | What to build next, step by step | Starting a new feature |
| `docs/decisions/` | Why we chose things (one file per decision) | To understand a past choice |
| `docs/worklog.md` | The story of what got built and why | To catch up on what happened |
 
---
 
## Where the code lives
 
- `app/(engineer)/` — the site engineer's screen (mobile-first), served at `/`. Its pieces are in
  `app/(engineer)/_components/`.
- `app/(pm)/` — the project manager's dashboard (desktop), served at `/dashboard`.
- `lib/cost.ts` — **all** cost calculation. One place, on purpose.
- `lib/labels.ts` — Albanian UI strings. No hardcoded text in components.
- `lib/prisma.ts` — the database client.
- `actions/` — server actions that write to the database.
- `prisma/schema.prisma` — the data model (source of truth). `prisma/seed.ts` loads the pilot
  project and its material/labor catalogs (placeholder figures until the real ones arrive).
- `app/generated/prisma/` — generated database client. Not in git; see setup below.
 
---
 
## How we develop
 
One feature = one branch. Branch off `develop`, describe the feature to Claude Code, review its
changes, test locally, then merge back via a PR. `develop` is the working/test branch; `main` is
production (what people on site see). Full rules are in `CLAUDE.md`; the shape of the loop is drawn
in `docs/ARCHITECTURE.md`.
 
---
 
## Run it locally
 
```bash
npm install
npx prisma generate         # builds the database client — the app won't start without it
```

Create `.env` in the project root with the Supabase values (ask the team). It has to be `.env`,
not `.env.local` — the Prisma commands only read `.env`.

```env
DATABASE_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

For `DATABASE_URL`, use the **Session pooler** connection string (Supabase → Connect → Session
pooler, port 5432). The direct `db.<ref>.supabase.co` host is IPv6-only and won't connect from most
networks.

Then start the app:

```bash
npm run db:seed             # only if the database is empty — loads the pilot project
npm run dev                 # http://localhost:3000 (engineer) and /dashboard (PM)
```

The shared Supabase database already has the tables. Only if you point at a fresh database, create
them first with `npx prisma migrate deploy`.

> **Working with Claude Code:** its sandbox blocks database ports, so it can't run `db:seed` or
> migrations itself — run those in your own terminal. The same goes for `npm run dev` if you want
> the page to load real data.

---

## One-time tooling setup

**GitHub CLI (`gh`)** — lets Claude Code open pull requests with a full title and description, and
edit them, instead of handing you text to paste.

```bash
# With Homebrew:
brew install gh

# Without Homebrew (Apple Silicon; use macOS_amd64 on an Intel Mac).
# Latest version number: https://github.com/cli/cli/releases/latest
V=2.100.0
curl -sSLO "https://github.com/cli/cli/releases/download/v$V/gh_${V}_macOS_arm64.zip"
unzip -q "gh_${V}_macOS_arm64.zip"
mkdir -p ~/.local/bin && cp "gh_${V}_macOS_arm64/bin/gh" ~/.local/bin/   # ~/.local/bin must be on your PATH
```

Then log in once — it opens your browser, so you have to do this yourself:

```bash
gh auth login
```

Answers: `GitHub.com` → `HTTPS` → *Authenticate Git with your GitHub credentials?* `No` (keeps your
existing `git push` setup) → `Login with a web browser`. Check with `gh auth status`.

**Git token scope** — if `git push` uses a personal access token, it needs the `workflow` scope as
well as `repo`, or GitHub rejects any push that touches `.github/workflows/`. Edit it at
github.com/settings/tokens.

**Vercel** — the deployed app needs `DATABASE_URL` in the Vercel project's environment variables
(same value as your `.env`), or it can't reach the database.
