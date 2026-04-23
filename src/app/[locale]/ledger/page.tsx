import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { getMockOverview } from "@/lib/ledger/mock-stats";
import { Link } from "@/i18n/navigation";

export default async function LedgerOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getCurrentProfile();
  if (!session?.profile) return null;

  const t = await getTranslations("Ledger");
  const seed = session.user.id;
  const mock = getMockOverview(seed);
  const displayName =
    session.profile.display_name ||
    session.profile.handle ||
    session.user.email ||
    t("memberFallback");
  const max = Math.max(...mock.series, 1);

  return (
    <div className="max-w-[1000px]">
      <p className="eyebrow mb-3">{t("overviewOverline")}</p>
      <h1
        className="font-display text-4xl md:text-5xl leading-tight mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("overviewTitle", { name: displayName })}
      </h1>
      <p className="font-display italic text-lg text-ink-soft mb-10 max-w-2xl">
        {t("overviewSubtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard
          label={t("kpiClicks7d")}
          value={String(mock.clicks7d)}
        />
        <StatCard
          label={t("kpiConversions7d")}
          value={String(mock.conversions7d)}
        />
        <StatCard
          label={t("kpiEstEur")}
          value={`€${mock.estCommissionEur.toFixed(0)}`}
        />
      </div>

      <div className="border border-rule bg-paper-warm/30 p-6 md:p-8 mb-10">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2
            className="font-display text-2xl"
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            {t("chart7dTitle")}
          </h2>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-faint">
            {t("chartMockLabel")}
          </span>
        </div>
        <div className="flex items-end justify-between gap-1 h-32 border-b border-rule pb-0">
          {mock.series.map((v, i) => (
            <div
              key={i}
              className="flex-1 min-w-0 flex flex-col items-center gap-1"
            >
              <div
                className="w-full max-w-10 mx-auto bg-oxblood/70 hover:bg-oxblood transition-colors"
                style={{ height: `${(v / max) * 100}%`, minHeight: 8 }}
                title={`${v}`}
              />
              <span className="font-mono text-[8px] text-ink-faint">
                {t("dayShort", { n: i + 1 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-rule p-6">
          <p className="eyebrow text-oxblood mb-2">{t("cardMapTeaserK")}</p>
          <h3
            className="font-display text-2xl mb-3"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            {t("cardMapTeaserTitle")}
          </h3>
          <p className="text-ink-soft text-sm mb-4">{t("cardMapTeaserBody")}</p>
          <Link
            href="/ledger/map-room"
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim hover:text-oxblood"
          >
            {t("cardMapCta")} →
          </Link>
        </div>
        <div className="border border-rule p-6">
          <p className="eyebrow text-oxblood mb-2">{t("cardBoardTeaserK")}</p>
          <h3
            className="font-display text-2xl mb-3"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            {t("cardBoardTeaserTitle")}
          </h3>
          <p className="text-ink-soft text-sm mb-4">
            {t("cardBoardTeaserBody")}
          </p>
          <Link
            href="/ledger/billboard"
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim hover:text-oxblood"
          >
            {t("cardBoardCta")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-rule pt-4">
      <p className="eyebrow mb-2 text-ink-faint">{label}</p>
      <p className="font-display text-3xl text-ink tabular-nums">{value}</p>
    </div>
  );
}
