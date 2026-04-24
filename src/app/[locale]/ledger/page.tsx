import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  getCreatorClickSeries,
  getCreatorConversions7d,
  getOperatorSummary,
} from "@/lib/ledger/stats";
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
  const supabase = await createClient();
  const { user, profile } = session;
  const displayName =
    profile.display_name || profile.handle || user.email || t("memberFallback");

  if (profile.role === "operator") {
    const op = await getOperatorSummary(supabase, user.id);
    const cur = op.currency;
    return (
      <div className="max-w-[1000px]">
        <p className="eyebrow mb-3">{t("operatorDeckOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-2"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("operatorOverviewTitle", { name: displayName })}
        </h1>
        <p className="font-display italic text-base sm:text-lg text-ink-soft mb-8 sm:mb-10 max-w-2xl">
          {t("operatorOverviewSubtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard
            label={t("kpiActiveBountiesOp")}
            value={String(op.activeBounties)}
          />
          <StatCard
            label={t("kpiConversions7dOp")}
            value={String(op.conv7d)}
          />
          <StatCard
            label={t("kpiVolume7dOp")}
            value={formatMoney(op.volumeCents7d, cur, locale)}
          />
        </div>
        <p className="text-sm text-ink-faint font-mono max-w-2xl">
          {t("operatorDeckFootnote")}
        </p>
      </div>
    );
  }

  const [{ series, total7d, byCountry }, conv] = await Promise.all([
    getCreatorClickSeries(supabase, user.id),
    getCreatorConversions7d(supabase, user.id),
  ]);
  const hasSignal = total7d > 0 || conv.count > 0;
  const max = Math.max(...series, 1);

  return (
    <div className="max-w-[1000px]">
      <p className="eyebrow mb-3">{t("overviewOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("overviewTitle", { name: displayName })}
      </h1>
      <p className="font-display italic text-base sm:text-lg text-ink-soft mb-8 sm:mb-10 max-w-2xl">
        {t(hasSignal ? "overviewSubtitleLive" : "overviewSubtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard
          label={t("kpiClicks7d")}
          value={String(total7d)}
        />
        <StatCard
          label={t("kpiConversions7d")}
          value={String(conv.count)}
        />
        <StatCard
          label={t("kpiEstEur")}
          value={formatMoney(conv.commissionCents, conv.currency, locale)}
        />
      </div>

      <div className="border border-rule bg-paper-warm/30 p-4 sm:p-6 md:p-8 mb-10">
        <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
          <h2
            className="font-display text-2xl"
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            {t("chart7dTitle")}
          </h2>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-faint">
            {t("chartLiveLabel")}
          </span>
        </div>
        {!hasSignal && (
          <p className="text-sm text-ink-faint font-display italic mb-4">
            {t("chartEmptyHint")}
          </p>
        )}
        <div className="flex items-end justify-between gap-1 h-32 border-b border-rule pb-0">
          {series.map((v, i) => (
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
        {byCountry.length > 0 && (
          <p className="mt-4 text-xs text-ink-faint font-mono">
            {t("topGeoHint", {
              list: byCountry
                .slice(0, 3)
                .map((c) => `${c.code} (${c.count})`)
                .join(" · "),
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="border border-rule p-4 sm:p-6">
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
        <div className="border border-rule p-4 sm:p-6">
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

function formatMoney(
  cents: number,
  currency: string,
  locale: string,
): string {
  const n = (cents ?? 0) / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency && currency.length === 3 ? currency : "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
