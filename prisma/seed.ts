import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * PLACEHOLDER PILOT DATA.
 *
 * Names, budgets and prices below are illustrative, NOT the real client's
 * figures — Moisi is gathering those (see docs/BUILD-PLAN.md, "Parallel task").
 * Replace this file's values when the real catalog arrives; the shape stays
 * the same.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PROJECT_NAME = "Kompleksi Astir";

const MATERIALS = [
  { name: "Çimento", category: "Bazë", defaultUnit: "thes", defaultCost: 950 },
  { name: "Hekur betoni Ø12", category: "Bazë", defaultUnit: "kg", defaultCost: 130 },
  { name: "Rërë lumi", category: "Inerte", defaultUnit: "m³", defaultCost: 1400 },
  { name: "Zhavorr", category: "Inerte", defaultUnit: "m³", defaultCost: 1100 },
  { name: "Tullë blloku", category: "Muraturë", defaultUnit: "copë", defaultCost: 45 },
  { name: "Beton C25/30", category: "Bazë", defaultUnit: "m³", defaultCost: 8500 },
];

const LABOR_ROLES = [
  { name: "Murator", skillLevel: 3, baseHourlyRate: 450 },
  { name: "Karpentier", skillLevel: 3, baseHourlyRate: 500 },
  { name: "Hekurkthyes", skillLevel: 2, baseHourlyRate: 420 },
  { name: "Punëtor krahu", skillLevel: 1, baseHourlyRate: 300 },
];

async function main() {
  // Idempotent: re-running the seed refreshes the catalogs rather than
  // stacking duplicates.
  const existing = await prisma.project.findFirst({
    where: { name: PROJECT_NAME },
  });

  if (existing) {
    await prisma.material.deleteMany({ where: { projectId: existing.id } });
    await prisma.laborRole.deleteMany({ where: { projectId: existing.id } });
  }

  const project = existing
    ? await prisma.project.update({
        where: { id: existing.id },
        data: { totalBudget: 42_000_000 },
      })
    : await prisma.project.create({
        data: {
          name: PROJECT_NAME,
          location: "Tiranë, Astir",
          totalBudget: 42_000_000,
          startDate: new Date("2026-02-12"),
          endDate: new Date("2026-12-31"),
        },
      });

  await prisma.material.createMany({
    data: MATERIALS.map((m) => ({ ...m, projectId: project.id })),
  });

  await prisma.laborRole.createMany({
    data: LABOR_ROLES.map((r) => ({ ...r, projectId: project.id })),
  });

  console.log(
    `Seeded "${project.name}" with ${MATERIALS.length} materials and ${LABOR_ROLES.length} labor roles.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
