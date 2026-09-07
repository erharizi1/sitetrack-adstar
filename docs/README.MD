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
 
- `src/app/(engineer)/` — the site engineer's screens (mobile-first).
- `src/app/(pm)/` — the project manager's dashboard (desktop).
- `src/components/` — shared UI (cards, forms, badges); `ui/` holds shadcn primitives.
- `src/lib/cost.ts` — **all** cost calculation. One place, on purpose.
- `src/lib/labels.ts` — Albanian UI strings. No hardcoded text in components.
- `src/lib/prisma.ts` — the database client.
- `src/actions/` — server actions that write to the database.
- `prisma/schema.prisma` — the data model (source of truth). `prisma/seed.ts` loads real pilot data.
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
```
 
Create `.env.local` in the project root with the Supabase values (see the team):
 
```env
DATABASE_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```
 
Then set up the database and start the app:
 
```bash
npx prisma migrate dev      # create the tables
npx prisma db seed          # load the pilot project (once seed.ts exists)
npm run dev                 # http://localhost:3000