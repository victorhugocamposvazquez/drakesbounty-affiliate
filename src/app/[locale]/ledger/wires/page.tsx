import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";

export default async function WiresPage({
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
        <p className="eyebrow text-oxblood mb-2">{t("wiresOpOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("wiresOpTitle")}
        </h1>
        <p className="text-ink-soft text-[17px] leading-relaxed mb-8">
          {t("wiresOpBody")}
        </p>
        <Link
          href="/ledger/settlement"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim"
        >
          ← {t("settlementTitle")}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("payout_requests")
    .select("id, amount_cents, currency, rail, status, destination_hint, requested_at, paid_at")
    .eq("creator_id", session.user.id)
    .order("requested_at", { ascending: false })
    .limit(50);

  if (error) {
    return <p className="text-oxblood text-sm font-mono">{error.message}</p>;
  }

  return (
    <div className="max-w-4xl">
      <p className="eyebrow text-oxblood mb-2">{t("wiresOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("wiresTitle")}
      </h1>
      <p className="text-ink-soft mb-8">{t("wiresIntro")}</p>

      {!rows || rows.length === 0 ? (
        <p className="text-ink-faint font-display italic">{t("wiresEmpty")}</p>
      ) : (
        <div className="border border-rule overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <th className="p-3">{t("wiresThId")}</th>
                <th className="p-3">{t("wiresThAmount")}</th>
                <th className="p-3">{t("wiresThRail")}</th>
                <th className="p-3">{t("wiresThDestination")}</th>
                <th className="p-3">{t("wiresThStatus")}</th>
                <th className="p-3">{t("wiresThWhen")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-rule/60">
                  <td className="p-3 font-mono text-xs">{row.id.slice(0, 8)}</td>
                  <td className="p-3 font-mono text-xs">
                    {formatMoney(row.amount_cents ?? 0, row.currency ?? "EUR", locale)}
                  </td>
                  <td className="p-3 font-mono text-xs uppercase">{String(row.rail)}</td>
                  <td className="p-3 font-mono text-xs">{row.destination_hint ?? "—"}</td>
                  <td className="p-3 font-mono text-xs uppercase">{String(row.status)}</td>
                  <td className="p-3 font-mono text-xs text-ink-dim">
                    {new Date(row.requested_at).toLocaleString(locale, {
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

function formatMoney(cents: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency && currency.length === 3 ? currency : "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}
