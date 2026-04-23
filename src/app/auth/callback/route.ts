import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / Magic-link / Email-confirmation callback.
 *
 * Supabase redirects here with one of:
 *   - `code`                   → PKCE / OAuth code to exchange for a session
 *   - `token_hash` + `type`    → OTP (magic link / signup confirmation)
 *
 * The `next` query param (set when we built the redirect URL on the server
 * action) tells us where to send the user after a successful exchange.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/";
  const role = url.searchParams.get("role");
  const locale = url.searchParams.get("locale") ?? "en";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/${locale}/oath/${role ?? "creator"}?authError=${encodeURIComponent(
            error.message,
          )}`,
          url.origin,
        ),
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as
        | "email"
        | "recovery"
        | "invite"
        | "magiclink"
        | "signup"
        | "email_change",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/${locale}/oath/${role ?? "creator"}?authError=${encodeURIComponent(
            error.message,
          )}`,
          url.origin,
        ),
      );
    }
  } else {
    return NextResponse.redirect(
      new URL(`/${locale}/oath/${role ?? "creator"}?authError=missing_code`, url.origin),
    );
  }

  const destination = next.startsWith("/") ? next : `/${next}`;
  return NextResponse.redirect(new URL(destination, url.origin));
}
