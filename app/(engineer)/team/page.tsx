import { prisma } from "@/lib/prisma";
import { projectIdsOf, requireRole } from "@/lib/auth";
import { childRole } from "@/lib/team";
import { TeamScreen } from "./_components/TeamScreen";

// Statuses change as people accept invites — never serve a cached copy.
export const dynamic = "force-dynamic";

const relative = new Intl.RelativeTimeFormat("sq", { numeric: "auto" });

/** "2 orë më parë" — how long ago an invite went out. */
function timeAgo(date: Date, now: number): string {
  const minutes = Math.round((date.getTime() - now) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

/**
 * The team — docs/design/final-designs/invite/. An engineer sees and adds the
 * technicians on their projects; the owner, the engineers.
 */
export default async function TeamPage() {
  const profile = await requireRole(["engineer", "owner"]);
  const role = childRole(profile.role)!;
  const projectIds = projectIdsOf(profile);

  const [projects, people] = await Promise.all([
    prisma.project.findMany({
      where: { id: { in: projectIds } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.profile.findMany({
      where: { role, memberships: { some: { projectId: { in: projectIds } } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const now = new Date().getTime();

  return (
    <TeamScreen
      role={role}
      projects={projects}
      people={people.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        status: person.status,
        invitedAgo:
          person.status === "invited" && person.invitedAt
            ? timeAgo(person.invitedAt, now)
            : null,
      }))}
    />
  );
}
