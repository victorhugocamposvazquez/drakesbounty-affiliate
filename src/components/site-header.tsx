import { getTranslations } from "next-intl/server";
import { BrandMark } from "./brand-mark";
import { LanguageToggle } from "./language-toggle";
import { Link } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";

/**
 * Top bar shared across public & authenticated pages.
 * Shows the brand on the left, optional nav in the center, and session state
 * (sign-in link OR the authenticated handle + logout form) on the right.
 */
export async function SiteHeader({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const tBrand = await getTranslations("Brand");
  const tNav = await getTranslations("Nav");
  const session = await getCurrentProfile();

  return (
    <header className="border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Drake's Bounty"
        >
          <BrandMark size={36} className="text-ink" />
          <div>
            <div className="font-display text-[13px] tracking-[0.38em] uppercase font-medium leading-none">
              {tBrand("wordmark")}{" "}
              <em className="italic text-oxblood font-normal">
                {tBrand("wordmarkItalic")}
              </em>
            </div>
            <div className="font-mono text-[8px] tracking-[0.3em] uppercase text-ink-faint mt-1">
              {tBrand("issueLabel")}
            </div>
          </div>
        </Link>

        {variant === "full" && (
          <nav className="hidden md:flex items-center gap-8 font-display text-[15px] text-ink-dim">
            <Link href="/code" className="hover:text-oxblood transition-colors">
              {tNav("code")}
            </Link>
            <Link
              href="/standards-index"
              className="hover:text-oxblood transition-colors"
            >
              {tNav("index")}
            </Link>
            {session?.profile?.onboarded_at && (
              <Link
                href="/ledger"
                className="hover:text-oxblood transition-colors"
              >
                {tNav("ledger")}
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {session ? (
            <SessionMenu
              label={
                session.profile?.handle
                  ? `@${session.profile.handle}`
                  : (session.user.email ?? tNav("memberDefault"))
              }
              logoutLabel={tNav("signOut")}
            />
          ) : (
            <Link
              href="/oath/creator"
              className="hidden md:inline font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim hover:text-oxblood transition-colors"
            >
              {tNav("signIn")}
            </Link>
          )}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

/**
 * Renders the signed-in handle + a logout form that posts to our server action.
 * Using a plain form avoids "use client" here and lets the header stay a
 * server component.
 */
function SessionMenu({
  label,
  logoutLabel,
}: {
  label: string;
  logoutLabel: string;
}) {
  async function handleSignOut() {
    "use server";
    await signOut("/");
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim">
        {label}
      </span>
      <form action={handleSignOut}>
        <button
          type="submit"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors"
        >
          {logoutLabel}
        </button>
      </form>
    </div>
  );
}
