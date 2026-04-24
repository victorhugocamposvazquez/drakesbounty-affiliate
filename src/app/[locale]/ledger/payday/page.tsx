import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  getCreatorCommission30d,
  getRecentConversions,
} from "@/lib/ledger/stats";
import { Link } from "@/i18n/navigation";

export default async function PaydayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Ledger");
  const session = await getCurrentProfile();
  if (!session?.profile) return null;

  if (session.profile.role === "operator") {
    return (
      <div className="max-w-2xl">
        <p className="eyebrow text-oxblood mb-2">{t("paydayOpOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("paydayOpTitle")}
        </h1>
        <p className="text-ink-soft text-[17px] leading-relaxed">
          {t("paydayOpBody")}
        </p>
        <p className="mt-6">
          <Link
            href="/ledger"
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim"
          >
            ← {t("backLedger")}
          </Link>
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [s30, recent] = await Promise.all([
    getCreatorCommission30d(supabase, session.user.id),
    getRecentConversions(supabase, session.user.id, 18),
  ]);
  const cur = s30.currency;

  return (
    <div className="max-w-4xl">
      <p className="eyebrow text-oxblood mb-2">{t("paydayOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("paydayTitle")}
      </h1>
      <p className="text-ink-soft mb-8 sm:mb-10 max-w-2xl">{t("paydayIntro")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
        <div className="border-2 border-oxblood/40 p-4 sm:p-6 bg-oxblood/[0.04]">
          <p className="eyebrow text-ink-faint mb-2">{t("chest30d")}</p>
          <p className="font-display text-3xl sm:text-4xl tabular-nums">
            {formatMoney(s30.commissionCents, cur, locale)}
          </p>
          <p className="mt-1 font-mono text-xs text-ink-faint">
            {t("chest30dCount", { n: s30.count })}
          </p>
        </div>
        <div className="border border-rule p-4 sm:p-6">
          <p className="eyebrow text-ink-faint mb-2">{t("chestNoteK")}</p>
          <p className="text-ink-soft text-sm leading-relaxed">
            {t("chestNoteBody")}
          </p>
        </div>
      </div>

      <h2 className="font-display text-2xl mb-4" style={{ fontVariationSettings: '"opsz" 96' }}>
        {t("paydayRecent")}
      </h2>
      {recent.length === 0 ? (
        <p className="text-ink-faint font-display italic">{t("paydayEmpty")}</p>
      ) : (
        <div className="border border-rule overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <th className="p-3">{t("thEvent")}</th>
                <th className="p-3">{t("thCommission")}</th>
                <th className="p-3">{t("thWhen")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-rule/60">
                  <td className="p-3 font-mono text-xs uppercase">
                    {r.event_type}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {r.commission_cents == null
                      ? "—"
                      : formatMoney(r.commission_cents, r.currency, locale)}
                  </td>
                  <td className="p-3 font-mono text-xs text-ink-dim">
                    {new Date(r.occurred_at).toLocaleString(locale, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
