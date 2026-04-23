import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. **Server-only** — bypasses RLS.
 * Use for trusted API routes (click logging, postbacks, admin scripts).
 * Never import from Client Components.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service configuration");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
