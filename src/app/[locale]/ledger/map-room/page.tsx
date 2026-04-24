import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getCreatorClickSeries } from "@/lib/ledger/stats";
import { Link } from "@/i18n/navigation";

export default async function MapRoomPage({
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
        <p className="eyebrow text-oxblood mb-2">{t("mapRoomOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl mb-4"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("mapRoomOperatorTitle")}
        </h1>
        <p className="text-ink-soft text-[17px] leading-relaxed mb-8">
          {t("mapRoomOperatorBody")}
        </p>
        <Link
          href="/ledger"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim"
        >
          ← {t("backLedger")}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { byCountry, total7d } = await getCreatorClickSeries(
    supabase,
    session.user.id,
  );
  const max = Math.max(...byCountry.map((c) => c.count), 1);

  return (
    <div className="max-w-3xl">
      <p className="eyebrow text-oxblood mb-2">{t("mapRoomOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("mapRoomTitle")}
      </h1>
      <p className="text-ink-soft text-[16px] sm:text-[17px] leading-relaxed mb-8 sm:mb-10">
        {t("mapRoomIntro")}
      </p>

      {total7d === 0 || byCountry.length === 0 ? (
        <div className="border border-dashed border-rule p-6 sm:p-10 text-center">
          <p className="font-display italic text-lg text-ink-faint">
            {t("mapRoomEmpty")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="eyebrow text-ink-faint mb-2">{t("mapRoomGeoK")}</p>
          {byCountry.map((row) => (
            <div
              key={row.code}
              className="flex items-center gap-4 border-b border-rule/80 pb-2"
            >
              <span className="font-mono text-sm w-8">{row.code}</span>
              <div className="flex-1 h-4 bg-ink/[0.06] min-w-0">
                <div
                  className="h-full bg-oxblood/80 transition-all"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-ink-dim w-8 text-right">
                {row.count}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-ink-faint font-mono max-w-lg">
        {t("mapRoomFootnote")}
      </p>
    </div>
  );
}
