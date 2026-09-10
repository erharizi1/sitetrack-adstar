import { prisma } from "@/lib/prisma";
import { sumLines } from "@/lib/cost";
import { requireRole } from "@/lib/auth";
import { labels } from "@/lib/labels";
import { signOut } from "@/actions/auth";
import { DailyLogScreen } from "./_components/DailyLogScreen";

// The day's log changes as the technician works — never serve a cached copy.
export const dynamic = "force-dynamic";

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function TechnicianPage() {
  const profile = await requireRole(["technician"]);

  // One project per technician in the pilot, so there's nothing to pick —
  // see docs/decisions/log.md.
  const projectId = profile.memberships[0]?.projectId;
  const project = projectId
    ? await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          materials: { orderBy: { name: "asc" } },
          laborRoles: { orderBy: { name: "asc" } },
        },
      })
    : null;

  if (!project) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-ink-muted">{labels.technician.noProject}</p>
        <form action={signOut}>
          <button type="submit" className="min-h-11 text-sm font-semibold text-steel">
            {labels.common.logout}
          </button>
        </form>
      </main>
    );
  }

  const logDate = todayUtc();
  const log = await prisma.dailyLog.findUnique({
    where: { projectId_logDate: { projectId: project.id, logDate } },
    include: {
      materials: { orderBy: { createdAt: "asc" } },
      labor: { orderBy: { createdAt: "asc" } },
    },
  });

  const materialLines = (log?.materials ?? []).map((line) => ({
    id: line.id,
    name: line.name,
    quantity: Number(line.quantity),
    unit: line.unit,
    unitCost: Number(line.unitCost),
    totalCost: Number(line.totalCost),
  }));

  const laborLines = (log?.labor ?? []).map((line) => ({
    id: line.id,
    roleName: line.roleName,
    workerCount: line.workerCount,
    hoursWorked: Number(line.hoursWorked),
    hourlyRate: Number(line.hourlyRate),
    totalCost: Number(line.totalCost),
  }));

  return (
    <DailyLogScreen
      projectId={project.id}
      projectName={project.name}
      dateLabel={formatDate(logDate)}
      dailyLogId={log?.id ?? null}
      status={log?.status ?? "draft"}
      materialPresets={project.materials.map((m) => ({
        id: m.id,
        name: m.name,
        defaultUnit: m.defaultUnit,
        defaultCost: Number(m.defaultCost),
      }))}
      laborPresets={project.laborRoles.map((r) => ({
        id: r.id,
        name: r.name,
        baseHourlyRate: Number(r.baseHourlyRate),
      }))}
      materialLines={materialLines}
      laborLines={laborLines}
      materialsTotal={sumLines(materialLines)}
      laborTotal={sumLines(laborLines)}
    />
  );
}
