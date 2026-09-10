# SiteTrack Albania — Architecture
 
> How the system is put together: cloud setup, environments, CI/CD, and the data model.
> Diagrams are Mermaid — they render in GitHub and VS Code, and stay editable as plain text.
> Read this when working on infrastructure, deployment, or the schema.
 
---
 
## Cloud setup
 
How code and data flow from the laptop to the people on site.
 
```mermaid
flowchart LR
    subgraph local[Your machine]
        vscode[VS Code + Claude Code]
    end
 
    subgraph github[GitHub · sitetrack-adstar]
        feat[feature/*] --> dev[develop]
        dev --> main[main]
    end
 
    subgraph vercel[Vercel]
        preview[Preview deploy<br/>from develop]
        prod[Production deploy<br/>from main]
    end
 
    supabase[(Supabase · PostgreSQL<br/>Frankfurt)]
 
    technician[Technician · phone]
    engineer[Engineer · desktop]
 
    vscode -->|push| feat
    dev -->|auto-deploy| preview
    main -->|auto-deploy| prod
    vscode -.->|local dev| supabase
    preview --> supabase
    prod --> supabase
    technician --> prod
    engineer --> prod
```
 
- **GitHub** holds the code. Work flows `feature/*` → `develop` → `main`.
- **Vercel** watches GitHub and deploys automatically: `develop` → a preview/test URL, `main` →
  the production URL that people on site use.
- **Supabase** is the database. The app (and local dev) read/write it.
---
 
## Environments
 
| Environment | Branch    | Where it runs        | Who sees it              |
|-------------|-----------|----------------------|--------------------------|
| Development | `develop` | Vercel preview URL   | Us — testing on phone + desktop |
| Production  | `main`    | Vercel production URL| Real users on the site   |
 
**Current state:** one Supabase project serves everything for now. Split into a separate
production database later — only when we're about to put it in front of the real technician.
 
---
 
## Development workflow
 
How one feature goes from idea to merged. The human + LLM loop that happens *before* the pipeline
below. (Rules for this live in `CLAUDE.md`; this is the shape of it.)
 
```mermaid
flowchart TD
    pick[Pick next feature<br/>from BUILD-PLAN.md] --> branch[Branch off develop<br/>feature/name]
    branch --> describe[Describe it to Claude Code<br/>from UI or intent · often by voice]
    describe --> propose[Claude Code proposes code]
    propose --> review{Review the diff}
    review -->|needs change| describe
    review -->|looks right| run[Run locally · npm run dev]
    run -->|not right| describe
    run -->|works| commit[Commit + push the branch]
    commit --> log[Ask Claude Code to<br/>log it to worklog.md]
    log --> pr[Open PR into develop]
```
 
The PR then enters the pipeline below. One feature per branch keeps each loop — and each Claude
Code session — small and focused.
 
---
 
## CI/CD pipeline
 
What runs on every change, so broken code can't reach `develop` or `main`.
 
```mermaid
flowchart TD
    push[Push or open PR] --> ci{GitHub Actions<br/>install · lint · build}
    ci -->|fails| block[Merge blocked<br/>fix and push again]
    ci -->|passes| review[Review + approve PR]
    review --> merge[Merge to develop]
    merge --> deploy[Vercel deploys preview]
    deploy --> test[Test on phone + desktop]
    test --> release[Open PR: develop → main]
    release --> proddeploy[Vercel deploys production]
```
 
Branch protection on `main` and `develop` requires a PR + passing CI before merge — so nothing
untested lands on either.
 
---
 
## Data model
 
Source of truth: `prisma/schema.prisma`. Eight tables: the six cost tables, plus accounts
(`Profile`, `ProjectMember`).
 
```mermaid
erDiagram
    Project    ||--o{ DailyLog    : has
    Project    ||--o{ Material    : "preset catalog"
    Project    ||--o{ LaborRole   : "preset catalog"
    DailyLog   ||--o{ LogMaterial : contains
    DailyLog   ||--o{ LogLabor    : contains
    Project    ||--o{ ProjectMember : "people on it"
    Profile    ||--o{ ProjectMember : "works on"
 
    Project {
        string  id PK
        string  name
        string  location
        decimal totalBudget
        date    startDate
        date    endDate
        string  status
    }
    DailyLog {
        string  id PK
        string  projectId FK
        date    logDate
        string  technicianName "column: engineerName"
        decimal totalCost
        string  status "draft/submitted/approved/rejected"
    }
    LogMaterial {
        string  id PK
        string  dailyLogId FK
        string  name
        decimal quantity
        string  unit
        decimal unitCost
        decimal totalCost
    }
    LogLabor {
        string  id PK
        string  dailyLogId FK
        string  roleName
        int     workerCount
        decimal hoursWorked
        decimal hourlyRate
        decimal totalCost
    }
    Material {
        string  id PK
        string  projectId FK
        string  name
        string  category
        string  defaultUnit
        decimal defaultCost
    }
    LaborRole {
        string  id PK
        string  projectId FK
        string  name
        int     skillLevel
        decimal baseHourlyRate
        decimal overtimeMultiplier
    }
    Profile {
        uuid    id PK "= Supabase Auth user id"
        string  email
        string  name
        string  role "owner/engineer/technician"
        string  status "invited/active/deactivated"
    }
    ProjectMember {
        uuid    profileId FK
        string  projectId FK
    }
```
 
Notes:
- One **DailyLog** per project per day (`@@unique([projectId, logDate])`).
- **Material** and **LaborRole** are per-project catalogs the technician picks from instead of typing.
- Money is always `Decimal`, never float. Cascade deletes from `Project` down to its logs/catalogs.
- **Profile** is one per person who can log in; its id is their Supabase Auth user id. Role and
  status live here, never in Supabase `user_metadata` (users can edit that).
- Row-level security is on for every table: the app only talks to the database through Prisma
  (as the tables' owner), so this just closes them to Supabase's public Data API.