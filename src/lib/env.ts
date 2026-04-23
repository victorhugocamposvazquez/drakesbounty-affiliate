/**
 * Resolves the public-facing app URL across environments.
 *
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL  → set explicitly (production with custom domain)
 *   2. NEXT_PUBLIC_VERCEL_URL → automatic per-deployment URL on Vercel previews
 *   3. http://localhost:3000  → local development fallback
 *
 * Always returns a URL **without** trailing slash so callers can safely do:
 *   `${getAppUrl()}/auth/callback`
 *
 * To enable preview auto-resolution, expose the system env var
 * `NEXT_PUBLIC_VERCEL_URL` in Vercel → Settings → Environment Variables
 * (toggle "System Environment Variables" or add it manually with value
 * `${VERCEL_URL}` for Preview only).
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Convenience for building absolute URLs. */
export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getAppUrl()}${p}`;
}
