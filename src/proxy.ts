import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Edge proxy (Next.js 16+): 1) next-intl: `/` → `/en` (o negociación), 2) Supabase session.
 */
export default async function proxy(request: NextRequest) {
  // Cualquier POST (Server Actions, formularios) no debe pasar por next-intl:
  // en Vercel/edge a veces la cabecera `next-action` no basta para detectarlas
  // y el intl devuelve HTML → "Unexpected token '<' ... is not valid JSON".
  if (request.method === "POST") {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      await updateSupabaseSession(request, response);
    } catch {
      // No bloquear redirect i18n si el refresh de cookies falla en el edge
    }
  }

  return response;
}

export const config = {
  // Debe coincidir con `routing.locales` (en, es) y con `/` para el redirect a locale
  matcher: ["/", "/(en|es)/:path*"],
};
