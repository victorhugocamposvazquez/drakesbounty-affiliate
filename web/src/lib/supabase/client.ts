import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for browser components (use inside "use client").
 * Auth session is managed via cookies synced by the server middleware.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
