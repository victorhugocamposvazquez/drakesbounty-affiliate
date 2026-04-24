import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";

type Row = {
  id: string;
  position: number;
  visible: boolean;
  custom_title: string | null;
  bounties: {
    id: string;
    title: string;
    status: string;
    vertical: string | null;
    payout_model: string;
  } | null;
};

export default async function BountiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Ledger");
  const session = await getCurrentProfile();
  if (!session?.profile) return null;
  const supabase = await createClient();

  if (session.profile.role === "operator") {
    const { data: rows, error } = await supabase
      .from("bounties")
      .select("id, title, status, vertical, payout_model, currency, created_at")
      .eq("operator_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) {
      return <p className="text-oxblood text-sm font-mono">{error.message}</p>;
    }
    return (
      <div className="max-w-4xl">
        <p className="eyebrow text-oxblood mb-2">{t("bountiesOpOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl mb-2"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("bountiesOpTitle")}
        </h1>
        <p className="text-ink-soft mb-8">{t("bountiesOpIntro")}</p>
        {(!rows || rows.length === 0) && (
          <p className="text-ink-faint font-display italic">{t("bountiesOpEmpty")}</p>
        )}
        {rows && rows.length > 0 && (
          <ul className="space-y-2 border-t border-rule">
            {rows.map((b) => (
              <li
                key={b.id}
                className="py-3 border-b border-rule flex flex-wrap items-baseline justify-between gap-2"
              >
                <span className="font-display text-lg">{b.title}</span>
                <span className="font-mono text-xs text-ink-faint">
                  {b.status} · {b.payout_model}
                  {b.vertical ? ` · ${b.vertical}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const { data, error } = await supabase
    .from("billboard_campaigns")
    .select(
      "id, position, visible, custom_title, bounties ( id, title, status, vertical, payout_model )",
    )
    .eq("creator_id", session.user.id)
    .order("position", { ascending: true });

  if (error) {
    return <p className="text-oxblood text-sm font-mono">{error.message}</p>;
  }

  const list = (data ?? []) as unknown as Row[];

  return (
    <div className="max-w-4xl">
      <p className="eyebrow text-oxblood mb-2">{t("bountiesCrOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("bountiesCrTitle")}
      </h1>
      <p className="text-ink-soft mb-8">{t("bountiesCrIntro")}</p>
      {list.length === 0 && (
        <p className="text-ink-faint font-display italic mb-6">
          {t("bountiesCrEmpty")}
        </p>
      )}
      {list.length > 0 && (
        <div className="border border-rule overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <th className="p-3">{t("thCampaign")}</th>
                <th className="p-3">{t("thBounty")}</th>
                <th className="p-3">{t("thStatus")}</th>
                <th className="p-3">{t("thModel")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const b = row.bounties;
                const title = row.custom_title || b?.title || "—";
                return (
                  <tr key={row.id} className="border-b border-rule/60">
                    <td className="p-3 font-mono text-xs">#{row.position + 1}</td>
                    <td className="p-3 font-display">{title}</td>
                    <td className="p-3 font-mono text-xs">
                      {b?.status ?? "—"}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {b?.payout_model ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {session.profile?.handle && (
        <p className="mt-8">
          <Link
            href={`/b/${session.profile.handle}`}
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-oxblood"
          >
            {t("bountiesViewPublic", { handle: session.profile.handle })} →
          </Link>
        </p>
      )}
    </div>
  );
}
