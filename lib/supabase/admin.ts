import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "./env";

/**
 * Supabase client with the secret key — full admin access (inviting people,
 * deactivating them). Server only: never import this into a client component.
 * Create one per call; it keeps no session.
 */
export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
