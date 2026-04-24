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
  const sessionLabel = session?.profile?.handle
    ? `@${session.profile.handle}`
    : (session?.user.email ?? tNav("memberDefault"));

  async function handleSignOut() {
    "use server";
    await signOut("/");
  }

  return (
    <header className="border-b border-rule">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between gap-4 sm:gap-8">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Drake's Bounty"
        >
          <BrandMark size={30} className="text-ink sm:w-9 sm:h-9" />
          <div className="min-w-0">
            <div className="font-display text-[11px] sm:text-[13px] tracking-[0.24em] sm:tracking-[0.38em] uppercase font-medium leading-none truncate">
              {tBrand("wordmark")}{" "}
              <em className="italic text-oxblood font-normal">
                {tBrand("wordmarkItalic")}
              </em>
            </div>
            <div className="hidden sm:block font-mono text-[8px] tracking-[0.3em] uppercase text-ink-faint mt-1">
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

        <div className="flex items-center gap-2 sm:gap-4">
          {session ? (
            <SessionMenu
              label={sessionLabel}
              logoutLabel={tNav("signOut")}
              signOutAction={handleSignOut}
            />
          ) : (
            <Link
              href="/oath/creator"
              className="hidden md:inline font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim hover:text-oxblood transition-colors"
            >
              {tNav("signIn")}
            </Link>
          )}
          <MobileMenu
            variant={variant}
            hasSession={Boolean(session)}
            sessionLabel={sessionLabel}
            signInLabel={tNav("signIn")}
            signOutLabel={tNav("signOut")}
            codeLabel={tNav("code")}
            indexLabel={tNav("index")}
            ledgerLabel={tNav("ledger")}
            showLedgerLink={Boolean(session?.profile?.onboarded_at)}
            signOutAction={handleSignOut}
          />
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
  signOutAction,
}: {
  label: string;
  logoutLabel: string;
  signOutAction: () => Promise<void>;
}) {
  return (
    <div className="hidden md:flex items-center gap-4">
      <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim max-w-[220px] truncate">
        {label}
      </span>
      <form action={signOutAction}>
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

function MobileMenu({
  variant,
  hasSession,
  sessionLabel,
  signInLabel,
  signOutLabel,
  codeLabel,
  indexLabel,
  ledgerLabel,
  showLedgerLink,
  signOutAction,
}: {
  variant: "full" | "compact";
  hasSession: boolean;
  sessionLabel: string;
  signInLabel: string;
  signOutLabel: string;
  codeLabel: string;
  indexLabel: string;
  ledgerLabel: string;
  showLedgerLink: boolean;
  signOutAction: () => Promise<void>;
}) {
  return (
    <details className="md:hidden relative">
      <summary className="list-none cursor-pointer px-2 py-1 border border-rule text-ink-dim hover:text-oxblood hover:border-oxblood transition-colors">
        <span className="sr-only">Open menu</span>
        <span className="block w-4 h-[1px] bg-current mb-1" />
        <span className="block w-4 h-[1px] bg-current mb-1" />
        <span className="block w-4 h-[1px] bg-current" />
      </summary>
      <div className="absolute right-0 mt-2 z-30 w-[240px] border border-rule bg-paper shadow-sm p-4">
        {hasSession && (
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-dim mb-3 truncate">
            {sessionLabel}
          </p>
        )}
        {variant === "full" && (
          <nav className="flex flex-col gap-3 mb-3 border-b border-rule pb-3">
            <Link href="/code" className="text-sm text-ink-dim hover:text-oxblood transition-colors">
              {codeLabel}
            </Link>
            <Link
              href="/standards-index"
              className="text-sm text-ink-dim hover:text-oxblood transition-colors"
            >
              {indexLabel}
            </Link>
            {showLedgerLink && (
              <Link href="/ledger" className="text-sm text-ink-dim hover:text-oxblood transition-colors">
                {ledgerLabel}
              </Link>
            )}
          </nav>
        )}

        {hasSession ? (
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full text-left font-mono text-[10px] tracking-[0.22em] uppercase text-ink-faint hover:text-oxblood transition-colors"
            >
              {signOutLabel}
            </button>
          </form>
        ) : (
          <Link
            href="/oath/creator"
            className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-faint hover:text-oxblood transition-colors"
          >
            {signInLabel}
          </Link>
        )}
      </div>
    </details>
  );
}
