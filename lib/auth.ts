import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "engineer" | "technician";

/** Where each role lands after logging in. */
export function homeFor(role: string): string {
  return role === "technician" ? "/" : "/dashboard";
}

/**
 * The logged-in person's profile (with their projects), or null.
 *
 * Identity comes from getClaims(), which verifies the login token — never
 * from getSession(). Role and status come from our own Profile table, not
 * from anything the user could edit. Cached for the length of one request.
 */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  return prisma.profile.findUnique({
    where: { id: userId },
    include: { memberships: true },
  });
});

/** For pages: anyone without the right role gets sent somewhere sensible. */
export async function requireRole(allowed: Role[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "active") redirect("/login?error=deactivated");
  if (!allowed.includes(profile.role as Role)) redirect(homeFor(profile.role));
  return profile;
}

/**
 * For server actions: refuse outright. Actions can be called by a direct
 * POST, not just from our screens, so every one of them checks.
 */
export async function requireActionRole(allowed: Role[]) {
  const profile = await getCurrentProfile();
  if (
    !profile ||
    profile.status !== "active" ||
    !allowed.includes(profile.role as Role)
  ) {
    throw new Error("Unauthorized");
  }
  return profile;
}

export function projectIdsOf(profile: {
  memberships: { projectId: string }[];
}): string[] {
  return profile.memberships.map((membership) => membership.projectId);
}
