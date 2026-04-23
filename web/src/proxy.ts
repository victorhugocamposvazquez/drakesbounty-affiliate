import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1. Handle i18n routing (redirects, locale prefix, etc.)
  const response = intlMiddleware(request);

  // 2. Refresh Supabase auth session on every request.
  //    Required by @supabase/ssr so the session cookie stays valid.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await updateSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  // Match all paths except:
  //  - /api/*              (route handlers manage their own auth)
  //  - /_next/*, /_vercel  (Next internals)
  //  - Static files         (anything with a dot → .png, .svg, .webp, …)
  //  - /@handle             (creator public billboards, locale-less)
  matcher: ["/((?!api|_next|_vercel|.*\\..*|@).*)"],
};
