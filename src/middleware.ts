import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Next.js only runs `src/middleware.ts` — `proxy.ts` is ignored. This chain:
 * 1) next-intl: `/` → `/en` (or locale negotation), 2) Supabase session refresh.
 */
export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await updateSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*|@).*)"],
};
