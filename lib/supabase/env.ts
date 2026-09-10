// Read at call time, not import time, so a build without Supabase variables
// (like CI's) still compiles — only a real request needs them.

export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return value;
}

/** Newer Supabase projects call it the publishable key; older ones the anon key. Either works. */
export function supabaseKey(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is not set",
    );
  }
  return value;
}

/**
 * The secret (service role) key — full admin access, server only. Never give it
 * a NEXT_PUBLIC_ name: those get sent to the browser.
 */
export function supabaseSecretKey(): string {
  const value =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error(
      "SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is not set",
    );
  }
  return value;
}
