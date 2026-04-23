import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session by reading/writing cookies on the
 * incoming request. This keeps the user logged in across navigations.
 *
 * MUST be called from the top-level proxy (`src/proxy.ts`) on every request.
 */
export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse,
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: do not remove this call — it refreshes the session.
  await supabase.auth.getUser();

  return response;
}
