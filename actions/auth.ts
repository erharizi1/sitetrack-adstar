"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

/** This site's own address, so email links come back here (local or live). */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

/**
 * Emails a login link. Always goes on to "check your email", whether or not
 * the address has an account — the page never reveals who is registered.
 * `shouldCreateUser: false`: only people someone invited can log in.
 */
export async function sendLoginLink(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/login?error=email");
  const email = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${await siteOrigin()}/auth/confirm`,
    },
  });

  const params = new URLSearchParams({ email });
  if (error) {
    // Supabase allows one link per address per minute.
    if (error.status === 429) params.set("wait", "1");
    else console.error("sendLoginLink:", error.status, error.message);
  }
  redirect(`/login/check?${params}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
