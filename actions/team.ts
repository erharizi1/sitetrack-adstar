"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { projectIdsOf, requireActionRole } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { inviteEmail } from "@/lib/invite-email";
import { labels } from "@/lib/labels";
import { siteOrigin } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { childRole } from "@/lib/team";

export type TeamResult = { ok: true } | { error: keyof typeof labels.team.errors };

const inviteSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  projectId: z.string().min(1),
});

/** The caller, who must be an engineer or the owner, and the role they add. */
async function manager() {
  const profile = await requireActionRole(["engineer", "owner"]);
  const role = childRole(profile.role);
  if (!role) throw new Error("Unauthorized");
  return { profile, role };
}

/**
 * Someone the caller may manage: exactly one role below them, on a project
 * they share. Anything else is refused.
 */
async function manageable(profileId: string) {
  const { profile, role } = await manager();
  const target = await prisma.profile.findUnique({
    where: { id: profileId },
    include: { memberships: { include: { project: true } } },
  });
  const shared = target?.memberships.find((m) =>
    projectIdsOf(profile).includes(m.projectId),
  );
  if (!target || target.role !== role || !shared) throw new Error("Unauthorized");
  return { profile, role, target, project: shared.project };
}

/**
 * Creates the login and emails the invite; returns the new login's id.
 * Supabase only makes the link (generateLink sends nothing) — the email is
 * ours (lib/invite-email.ts), sent through our own mail account (lib/email.ts).
 */
async function sendInvite(
  email: string,
  details: { firstName: string; invitedBy: string; project: string; role: string },
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
  if (error || !data.user) {
    console.error("generateLink:", error?.status, error?.message);
    return null;
  }

  const params = new URLSearchParams({
    token_hash: data.properties.hashed_token,
    type: "invite",
  });
  const link = `${await siteOrigin()}/auth/confirm?${params}`;

  try {
    await sendEmail({ to: email, ...inviteEmail({ ...details, link }) });
  } catch (err) {
    console.error("sendInvite email:", err);
    // Don't leave behind a login nobody was told about.
    await admin.auth.admin.deleteUser(data.user.id);
    return null;
  }
  return data.user.id;
}

export async function invitePerson(
  input: z.input<typeof inviteSchema>,
): Promise<TeamResult> {
  const { profile, role } = await manager();

  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };
  const { firstName, lastName, email, projectId } = parsed.data;
  if (!projectIdsOf(profile).includes(projectId)) throw new Error("Unauthorized");

  if (await prisma.profile.findUnique({ where: { email } })) {
    return { error: "exists" };
  }

  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const userId = await sendInvite(email, {
    firstName,
    invitedBy: profile.name,
    project: project.name,
    role: labels.roles[role].toLowerCase(),
  });
  if (!userId) return { error: "failed" };

  await prisma.profile.create({
    data: {
      id: userId,
      email,
      name: `${firstName} ${lastName}`,
      role,
      status: "invited",
      invitedById: profile.id,
      invitedAt: new Date(),
      memberships: { create: { projectId } },
    },
  });

  revalidatePath("/team");
  return { ok: true };
}

/**
 * Resending replaces the pending login: delete it (its old link dies with it),
 * invite again, and move the profile over to the new id (its project links
 * follow, via the foreign key's ON UPDATE CASCADE). Starting fresh also covers
 * a login Supabase already marked confirmed without our app ever seeing it.
 */
export async function resendInvite(profileId: string): Promise<TeamResult> {
  const { profile, role, target, project } = await manageable(profileId);
  if (target.status !== "invited") throw new Error("Only pending invites can be resent");

  const { error } = await createAdminClient().auth.admin.deleteUser(target.id);
  if (error && error.status !== 404) {
    console.error("deleteUser:", error.status, error.message);
    return { error: "failed" };
  }

  const userId = await sendInvite(target.email, {
    firstName: target.name.split(/\s+/)[0],
    invitedBy: profile.name,
    project: project.name,
    role: labels.roles[role].toLowerCase(),
  });
  if (!userId) return { error: "failed" };

  await prisma.profile.update({
    where: { id: target.id },
    data: { id: userId, invitedAt: new Date() },
  });

  revalidatePath("/team");
  return { ok: true };
}

/** Blocks the login (a ban on the Supabase account) and marks the profile. */
export async function deactivatePerson(profileId: string): Promise<TeamResult> {
  const { target } = await manageable(profileId);

  const { error } = await createAdminClient().auth.admin.updateUserById(target.id, {
    ban_duration: "876000h", // ~100 years: until reactivated
  });
  if (error) {
    console.error("deactivate:", error.status, error.message);
    return { error: "failed" };
  }

  await prisma.profile.update({
    where: { id: target.id },
    data: { status: "deactivated" },
  });

  revalidatePath("/team");
  return { ok: true };
}

export async function reactivatePerson(profileId: string): Promise<TeamResult> {
  const { target } = await manageable(profileId);

  const { error } = await createAdminClient().auth.admin.updateUserById(target.id, {
    ban_duration: "none",
  });
  if (error) {
    console.error("reactivate:", error.status, error.message);
    return { error: "failed" };
  }

  await prisma.profile.update({
    where: { id: target.id },
    data: { status: "active" },
  });

  revalidatePath("/team");
  return { ok: true };
}
