"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { laborLineCost, materialLineCost } from "@/lib/cost";

/**
 * Today's date with the time stripped — DailyLog.logDate is a @db.Date and
 * there's one log per project per day (@@unique([projectId, logDate])).
 */
function today(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
}

/**
 * The day's log, created on first use. Every add-action funnels through here
 * so the engineer never has to "start" a day explicitly.
 */
async function getOrCreateTodayLog(projectId: string) {
  const logDate = today();

  return prisma.dailyLog.upsert({
    where: { projectId_logDate: { projectId, logDate } },
    update: {},
    create: {
      projectId,
      logDate,
      // No users table in the pilot — the engineer is a name, not an account.
      engineerName: "Inxhinieri i kantierit",
    },
  });
}

/** Re-sums the day from its saved lines, so the stored total can't drift. */
async function recalculateTotal(dailyLogId: string) {
  const log = await prisma.dailyLog.findUniqueOrThrow({
    where: { id: dailyLogId },
    include: { materials: true, labor: true },
  });

  const total =
    log.materials.reduce((sum, m) => sum + Number(m.totalCost), 0) +
    log.labor.reduce((sum, l) => sum + Number(l.totalCost), 0);

  await prisma.dailyLog.update({
    where: { id: dailyLogId },
    data: { totalCost: total },
  });
}

export async function addMaterial(input: {
  projectId: string;
  materialId: string;
  quantity: number;
}) {
  const material = await prisma.material.findUniqueOrThrow({
    where: { id: input.materialId },
  });

  const unitCost = Number(material.defaultCost);
  const log = await getOrCreateTodayLog(input.projectId);

  await prisma.logMaterial.create({
    data: {
      dailyLogId: log.id,
      name: material.name,
      quantity: input.quantity,
      unit: material.defaultUnit,
      unitCost,
      totalCost: materialLineCost(input.quantity, unitCost),
    },
  });

  await recalculateTotal(log.id);
  revalidatePath("/");
}

export async function addLabor(input: {
  projectId: string;
  laborRoleId: string;
  workerCount: number;
  hoursWorked: number;
}) {
  const role = await prisma.laborRole.findUniqueOrThrow({
    where: { id: input.laborRoleId },
  });

  const hourlyRate = Number(role.baseHourlyRate);
  const log = await getOrCreateTodayLog(input.projectId);

  await prisma.logLabor.create({
    data: {
      dailyLogId: log.id,
      roleName: role.name,
      workerCount: input.workerCount,
      hoursWorked: input.hoursWorked,
      hourlyRate,
      totalCost: laborLineCost({
        workerCount: input.workerCount,
        hoursWorked: input.hoursWorked,
        hourlyRate,
      }),
    },
  });

  await recalculateTotal(log.id);
  revalidatePath("/");
}

export async function removeMaterial(id: string) {
  const line = await prisma.logMaterial.delete({ where: { id } });
  await recalculateTotal(line.dailyLogId);
  revalidatePath("/");
}

export async function removeLabor(id: string) {
  const line = await prisma.logLabor.delete({ where: { id } });
  await recalculateTotal(line.dailyLogId);
  revalidatePath("/");
}

/** draft → submitted. The PM sees it from here (Phase 2). */
export async function submitDay(dailyLogId: string) {
  await prisma.dailyLog.update({
    where: { id: dailyLogId },
    data: { status: "submitted", submittedAt: new Date() },
  });

  revalidatePath("/");
}
