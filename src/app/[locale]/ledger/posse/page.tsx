import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { Link } from "@/i18n/navigation";

export default async function PossePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getCurrentProfile();
  if (!session?.profile) return null;

  const t = await getTranslations("Ledger");

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-oxblood mb-2">{t("possePageOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("possePageTitle")}
      </h1>
      <p className="text-ink-soft text-[16px] sm:text-[17px] leading-relaxed mb-8">
        {t("possePageIntro")}
      </p>

      <div className="border border-dashed border-rule p-6 sm:p-8 mb-8">
        <p className="eyebrow text-ink-faint mb-2">{t("posseRoadmapK")}</p>
        <p className="text-sm sm:text-[15px] text-ink-soft leading-relaxed">
          {t("posseRoadmapBody")}
        </p>
      </div>

      <p className="text-xs text-ink-faint font-mono">
        <Link
          href="/code"
          prefetch
          className="text-ink-dim hover:text-oxblood underline-offset-4 hover:underline"
        >
          {t("rereadCode")}
        </Link>
      </p>
    </div>
  );
}
