import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Edge proxy (Next.js 16+): 1) next-intl: `/` → `/en` (o negociación), 2) Supabase session.
 */
export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await updateSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*|@).*)"],
};
