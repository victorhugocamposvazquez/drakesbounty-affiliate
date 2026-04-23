import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

export default async function LedgerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getCurrentProfile();

  // Not signed in → send to the threshold.
  if (!session) {
    redirect(`/${locale}`);
  }

  // Signed in but hasn't sealed the oath yet → back to the oath form.
  if (!session.profile?.onboarded_at) {
    const fallbackRole = session.profile?.role ?? "creator";
    redirect(`/${locale}/oath/${fallbackRole}`);
  }

  const t = await getTranslations("Ledger");
  const { user, profile } = session;
  const displayName =
    profile.display_name || profile.handle || user.email || t("memberFallback");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="compact" />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-16">
        <p className="eyebrow mb-3">{t("overline")}</p>
        <h1
          className="font-display text-5xl md:text-6xl leading-tight mb-2"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("welcome", { name: displayName })}
        </h1>
        <p className="font-display italic text-lg text-ink-soft mb-12 max-w-2xl">
          {t("subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <LedgerStat
            label={t("statRole")}
            value={t(`roles.${profile.role}`)}
          />
          <LedgerStat
            label={t("statHandle")}
            value={profile.handle ? `@${profile.handle}` : "—"}
          />
          <LedgerStat
            label={t("statJoined")}
            value={
              profile.onboarded_at
                ? new Intl.DateTimeFormat(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(profile.onboarded_at))
                : "—"
            }
          />
        </div>

        <div className="border border-rule bg-paper-warm/30 p-8 max-w-2xl">
          <p className="eyebrow mb-2 text-oxblood">{t("comingSoonLabel")}</p>
          <h2
            className="font-display text-3xl mb-3"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {t("comingSoonTitle")}
          </h2>
          <p className="text-ink-soft mb-6">{t("comingSoonBody")}</p>
          <Link
            href="/code"
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim hover:text-oxblood transition-colors"
          >
            {t("rereadCode")} →
          </Link>
        </div>
      </main>
    </div>
  );
}

function LedgerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-rule pt-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-display text-2xl leading-tight">{value}</p>
    </div>
  );
}
