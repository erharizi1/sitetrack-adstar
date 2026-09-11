import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { homeFor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Where every email link lands — login links and invites alike.
 *
 * The link carries a token_hash that's verified here, on the server. Unlike
 * the default PKCE code, that works even when the email is opened on a
 * different device from the one that asked for it (and invites have no
 * "asking" device at all).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) redirect("/login/expired");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error || !data.user) redirect("/login/expired");

  const profile = await prisma.profile.findUnique({
    where: { id: data.user.id },
  });

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=account");
  }
  if (profile.status === "deactivated") {
    await supabase.auth.signOut();
    redirect("/login?error=deactivated");
  }
  if (profile.status === "invited") {
    // First time through an invite link: the account is now in use.
    await prisma.profile.update({
      where: { id: profile.id },
      data: { status: "active" },
    });
  }

  redirect(homeFor(profile.role));
}
