"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { laborLineCost, materialLineCost } from "@/lib/cost";
import { projectIdsOf, requireActionRole } from "@/lib/auth";

// Server actions are reachable by a direct POST, not only through the screen,
// so every one checks who is calling and what they're allowed to touch.

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

/** The logged-in technician, who must work on this project. */
async function technicianOn(projectId: string) {
  const profile = await requireActionRole(["technician"]);
  if (!projectIdsOf(profile).includes(projectId)) {
    throw new Error("Unauthorized");
  }
  return profile;
}

/**
 * The day's log, created on first use. Every add-action funnels through here
 * so the technician never has to "start" a day explicitly.
 */
async function getOrCreateTodayLog(projectId: string, technicianName: string) {
  const logDate = today();

  const log = await prisma.dailyLog.upsert({
    where: { projectId_logDate: { projectId, logDate } },
    update: {},
    create: { projectId, logDate, technicianName },
  });

  if (log.status !== "draft") {
    throw new Error("This day has already been submitted");
  }
  return log;
}

/** A day that's still editable, on a project the caller works on. */
async function editableLog(dailyLogId: string) {
  const log = await prisma.dailyLog.findUniqueOrThrow({
    where: { id: dailyLogId },
  });
  await technicianOn(log.projectId);
  if (log.status !== "draft") {
    throw new Error("This day has already been submitted");
  }
  return log;
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
  const profile = await technicianOn(input.projectId);
  if (!(input.quantity > 0)) throw new Error("Quantity must be positive");

  const material = await prisma.material.findUniqueOrThrow({
    where: { id: input.materialId },
  });
  if (material.projectId !== input.projectId) throw new Error("Unauthorized");

  const unitCost = Number(material.defaultCost);
  const log = await getOrCreateTodayLog(input.projectId, profile.name);

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
  const profile = await technicianOn(input.projectId);
  if (!(input.workerCount > 0) || !(input.hoursWorked > 0)) {
    throw new Error("Workers and hours must be positive");
  }

  const role = await prisma.laborRole.findUniqueOrThrow({
    where: { id: input.laborRoleId },
  });
  if (role.projectId !== input.projectId) throw new Error("Unauthorized");

  const hourlyRate = Number(role.baseHourlyRate);
  const log = await getOrCreateTodayLog(input.projectId, profile.name);

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
  await requireActionRole(["technician"]);
  const line = await prisma.logMaterial.findUniqueOrThrow({ where: { id } });
  await editableLog(line.dailyLogId);

  await prisma.logMaterial.delete({ where: { id } });
  await recalculateTotal(line.dailyLogId);
  revalidatePath("/");
}

export async function removeLabor(id: string) {
  await requireActionRole(["technician"]);
  const line = await prisma.logLabor.findUniqueOrThrow({ where: { id } });
  await editableLog(line.dailyLogId);

  await prisma.logLabor.delete({ where: { id } });
  await recalculateTotal(line.dailyLogId);
  revalidatePath("/");
}

/** draft → submitted. The engineer sees it from here (Phase 2). */
export async function submitDay(dailyLogId: string) {
  await requireActionRole(["technician"]);
  await editableLog(dailyLogId);

  await prisma.dailyLog.update({
    where: { id: dailyLogId },
    data: { status: "submitted", submittedAt: new Date() },
  });

  revalidatePath("/");
}
