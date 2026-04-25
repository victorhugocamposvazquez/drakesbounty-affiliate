import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SettlementRequestForm } from "@/components/ledger/settlement-request-form";
import { Link } from "@/i18n/navigation";

export default async function SettlementPage({
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
        <p className="eyebrow text-oxblood mb-2">{t("settlementOpOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("settlementOpTitle")}
        </h1>
        <p className="text-ink-soft text-[17px] leading-relaxed mb-8">
          {t("settlementOpBody")}
        </p>
        <Link
          href="/ledger/payday"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim"
        >
          ← {t("paydayTitle")}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: convs }, { data: payouts }] = await Promise.all([
    supabase
      .from("conversions")
      .select("commission_cents, currency, occurred_at")
      .eq("creator_id", session.user.id),
    supabase
      .from("payout_requests")
      .select("id, amount_cents, currency, rail, status, requested_at")
      .eq("creator_id", session.user.id)
      .order("requested_at", { ascending: false })
      .limit(12),
  ]);

  const totalCommission = (convs ?? []).reduce(
    (sum, row) => sum + (row.commission_cents ?? 0),
    0,
  );
  const activePayouts = (payouts ?? []).filter((r) =>
    ["requested", "reviewing", "scheduled"].includes(String(r.status)),
  );
  const paidPayouts = (payouts ?? []).filter((r) => String(r.status) === "paid");
  const reserved = activePayouts.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);
  const paid = paidPayouts.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);
  const available = Math.max(0, totalCommission - reserved - paid);
  const currency = (
    (convs ?? []).find((r) => r.currency && r.currency.length === 3)?.currency ?? "EUR"
  ).toUpperCase();

  return (
    <div className="max-w-4xl">
      <p className="eyebrow text-oxblood mb-2">{t("settlementOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("settlementTitle")}
      </h1>
      <p className="text-ink-soft mb-8 sm:mb-10 max-w-2xl">{t("settlementIntro")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <StatCard label={t("settlementAvailable")} value={formatMoney(available, currency, locale)} />
        <StatCard label={t("settlementPending")} value={formatMoney(reserved, currency, locale)} />
        <StatCard label={t("settlementPaid")} value={formatMoney(paid, currency, locale)} />
      </div>

      <SettlementRequestForm availableCents={available} currency={currency} />
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

function formatMoney(cents: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency && currency.length === 3 ? currency : "EUR",
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}
