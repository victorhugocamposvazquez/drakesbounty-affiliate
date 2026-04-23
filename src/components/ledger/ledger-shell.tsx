import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";
import { LedgerNav } from "./ledger-nav";

export async function LedgerShell({
  children,
  displayName,
  handleLine,
  rankLabel,
  role,
}: {
  children: React.ReactNode;
  displayName: string;
  handleLine: string;
  rankLabel: string;
  role: "creator" | "operator" | "admin";
}) {
  const t = await getTranslations("LedgerShell");

  async function handleSignOut() {
    "use server";
    await signOut("/");
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[minmax(0,240px)_1fr]">
      <aside className="border-b md:border-b-0 md:border-r border-rule bg-ink/[0.02] flex flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-6 pt-6 pb-6 border-b border-rule"
        >
          <BrandMark size={36} className="text-ink shrink-0" />
          <div>
            <div className="font-display text-[13px] tracking-[0.38em] uppercase font-medium leading-none">
              {t("brandLine1")}{" "}
              <em className="italic text-oxblood font-normal">
                {t("brandLine2")}
              </em>
            </div>
            <div className="font-mono text-[8px] tracking-[0.3em] uppercase text-ink-faint mt-1">
              {t("ledgerTag")}
            </div>
          </div>
        </Link>

        <LedgerNav role={role} />

        <div className="mt-auto px-6 py-3 border-t border-rule flex items-center justify-between gap-2">
          <LanguageToggle />
        </div>

        <div className="px-6 py-4 border-t border-rule flex items-center gap-3">
          <div className="h-9 w-9 border border-oxblood/30 flex items-center justify-center font-display italic text-oxblood text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs truncate" title={handleLine}>
              {handleLine}
            </p>
            <p className="font-mono text-[9px] tracking-widest uppercase text-ink-faint">
              {rankLabel}
            </p>
          </div>
        </div>
        <form action={handleSignOut} className="px-6 pb-5">
          <button
            type="submit"
            className="w-full text-left font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors"
          >
            {t("signOut")}
          </button>
        </form>
      </aside>

      <div className="min-h-screen min-w-0 flex flex-col">
        <div className="flex-1 px-4 sm:px-8 py-8 md:py-10 lg:pl-10">{children}</div>
      </div>
    </div>
  );
}
