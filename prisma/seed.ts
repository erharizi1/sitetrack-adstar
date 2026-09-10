import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * PLACEHOLDER PILOT DATA.
 *
 * Names, budgets and prices below are illustrative, NOT the real client's
 * figures — Moisi is gathering those (see docs/BUILD-PLAN.md, "Parallel task").
 * Replace this file's values when the real catalog arrives; the shape stays
 * the same.
 *
 * ACCOUNTS. Nobody is above the Owner to invite them, so the seed creates the
 * Owner's login directly: set SEED_OWNER_EMAIL (and SEED_OWNER_NAME). To test
 * before sending invites, SEED_ENGINEER_EMAIL and SEED_TECHNICIAN_EMAIL (each
 * with an optional _NAME) create those accounts too. Needs SUPABASE_SECRET_KEY.
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

const ACCOUNTS = [
  { role: "owner", email: process.env.SEED_OWNER_EMAIL, name: process.env.SEED_OWNER_NAME ?? "Pronari" },
  { role: "engineer", email: process.env.SEED_ENGINEER_EMAIL, name: process.env.SEED_ENGINEER_NAME ?? "Inxhinieri" },
  { role: "technician", email: process.env.SEED_TECHNICIAN_EMAIL, name: process.env.SEED_TECHNICIAN_NAME ?? "Tekniku" },
];

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Creating accounts needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** The Supabase Auth user with this email, created (already confirmed) if missing. */
async function ensureAuthUser(admin: ReturnType<typeof adminClient>, email: string) {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 1000) break;
  }
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  return data.user.id;
}

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

  const accounts = ACCOUNTS.filter((account) => account.email);
  if (accounts.length === 0) {
    console.log("No SEED_OWNER_EMAIL set — skipped accounts.");
    return;
  }

  const admin = adminClient();
  for (const account of accounts) {
    const email = account.email!.trim().toLowerCase();
    const id = await ensureAuthUser(admin, email);
    await prisma.profile.upsert({
      where: { id },
      update: { email, name: account.name, role: account.role, status: "active" },
      create: { id, email, name: account.name, role: account.role, status: "active" },
    });
    await prisma.projectMember.upsert({
      where: { profileId_projectId: { profileId: id, projectId: project.id } },
      update: {},
      create: { profileId: id, projectId: project.id },
    });
    console.log(`Account ready: ${account.role} ${email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
