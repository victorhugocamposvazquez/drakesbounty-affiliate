import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { ArsenalAiAssistant } from "@/components/ledger/arsenal-ai-assistant";
import { ArsenalCopyBank } from "@/components/ledger/arsenal-copy-bank";
import { getArsenalOpenAIKey } from "@/lib/arsenal/openai-generate";
import { Link } from "@/i18n/navigation";

const ARSENAL_LINKS = [
  { href: "/ledger/billboard", labelKey: "arsenalLinkBillboard" as const },
  { href: "/ledger/bounties", labelKey: "arsenalLinkBounties" as const },
  { href: "/ledger/map-room", labelKey: "arsenalLinkMap" as const },
  { href: "/ledger/payday", labelKey: "arsenalLinkPayday" as const },
  { href: "/ledger/settlement", labelKey: "arsenalLinkSettlement" as const },
  { href: "/code", labelKey: "arsenalLinkCode" as const },
  { href: "/standards-index", labelKey: "arsenalLinkStandards" as const },
];

export default async function ArsenalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getCurrentProfile();
  if (!session?.profile) return null;

  const t = await getTranslations("Ledger");
  const localeKey = (locale === "es" ? "es" : "en") as "en" | "es";
  const arsenalAiConfigured = Boolean(getArsenalOpenAIKey());

  return (
    <div className="max-w-3xl">
      <p className="eyebrow text-oxblood mb-2">{t("arsenalPageOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("arsenalPageTitle")}
      </h1>
      <p className="text-ink-soft text-[16px] sm:text-[17px] leading-relaxed mb-8 sm:mb-10 max-w-2xl">
        {t("arsenalPageIntro")}
      </p>

      <ArsenalAiAssistant
        locale={localeKey}
        configured={arsenalAiConfigured}
      />

      <ArsenalCopyBank
        items={[
          { title: t("arsenalCopy1Title"), body: t("arsenalCopy1Body") },
          { title: t("arsenalCopy2Title"), body: t("arsenalCopy2Body") },
          { title: t("arsenalCopy3Title"), body: t("arsenalCopy3Body") },
          { title: t("arsenalCopy4Title"), body: t("arsenalCopy4Body") },
        ]}
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 sm:mb-12">
        {ARSENAL_LINKS.map((row) => (
          <li key={row.href}>
            <Link
              href={row.href}
              prefetch
              className="block border border-rule bg-paper/40 px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-dim transition-colors hover:border-oxblood/40 hover:text-oxblood"
            >
              {t(row.labelKey)} →
            </Link>
          </li>
        ))}
      </ul>

      <div className="border border-rule bg-paper-warm/20 p-5 sm:p-6">
        <p className="eyebrow text-oxblood mb-2">{t("arsenalToolkitK")}</p>
        <h2
          className="font-display text-xl sm:text-2xl mb-3"
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          {t("arsenalToolkitTitle")}
        </h2>
        <p className="text-sm sm:text-[15px] text-ink-soft leading-relaxed">
          {t("arsenalToolkitBody")}
        </p>
      </div>
    </div>
  );
}
