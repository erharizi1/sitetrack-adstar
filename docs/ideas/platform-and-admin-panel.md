# SiteTrack as a platform + admin panel

*Raised by Eri, 2026-09-11. Status: idea, to discuss. Not decided.*

## The idea, in Eri's words (condensed)

Today the app serves one firm, and the first account was created by hand with Eri's own name.
Tomorrow it could serve **different companies**. So see it as a **platform**:

- Eri, as the **platform admin**, onboards a new company: creates the company, gives it access,
  and guides them. From there the company sets itself up.
- Eri needs **their own tools on the side** to run the platform: get into a company's accounts to
  fix things (like today's invite problems), give permissions, and change things companies ask
  for **without having to go through code** each time.
- For now Eri can see what every company is doing. **Later, access to company data gets
  restricted.**
- Why now: it's the moment to think about it. Later it's harder to change.

## How it could fit what's built (notes from the discussion)

**A new top level, the Company.** Every project and every person belongs to exactly one company;
one company never sees another's data.

**A new role above everyone, the platform admin.** Not part of any company; looks after all of
them.

**The onboarding chain becomes:** platform admin creates the company and invites its Owner →
the Owner adds engineers → engineers add technicians. The last two steps exist
(`feature/team-invite`); the first reuses the same invite mechanism.

**What the admin panel could do, over time:**

- List companies, their people and status.
- Create a company and invite its Owner (onboarding).
- Fix things: resend invites, reactivate people, change roles, correct data.
- Later: "see the app as this person" for support. Useful, but it should be logged, visible, and
  something companies agree to, since it means seeing their cost data.

**Company "domain":** simplest first. One app, and the company is known from who logs in.
Separate addresses per company (e.g. `firma.sitetrack.al`) only if a customer needs it.

**Timing (recommendation, not decided):** settle the model first and build a thin Company
foundation (Company table, platform-admin role, everything hanging off a company) before the
Phase 2 dashboards, so every dashboard is per-company from day one. The admin panel's screens can
wait until a second company is real.

## Open questions

- Who can create a company: only the platform admin, or self sign-up later?
- What exactly can the platform admin change, and what gets logged?
- When access becomes restricted, what does a company agree to (support access, data handling)?
- Does a person ever belong to more than one company?
