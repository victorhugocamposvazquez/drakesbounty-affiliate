import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";

const GLOSSARY_KEYS = [
  { term: "glossaryNgrTerm", def: "glossaryNgrDef" },
  { term: "glossaryCpaTerm", def: "glossaryCpaDef" },
  { term: "glossaryRevshareTerm", def: "glossaryRevshareDef" },
  { term: "glossaryPostbackTerm", def: "glossaryPostbackDef" },
  { term: "glossaryFtdTerm", def: "glossaryFtdDef" },
  { term: "glossaryRailTerm", def: "glossaryRailDef" },
  { term: "glossaryNcoTerm", def: "glossaryNcoDef" },
] as const;

export default async function AlmanacPage({
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
    <div className="max-w-3xl">
      <p className="eyebrow text-oxblood mb-2">{t("almanacPageOverline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("almanacPageTitle")}
      </h1>
      <p className="text-ink-soft text-[16px] sm:text-[17px] leading-relaxed mb-8 sm:mb-10 max-w-2xl">
        {t("almanacPageIntro")}
      </p>

      <dl className="space-y-0 border-t border-rule">
        {GLOSSARY_KEYS.map((row) => (
          <div
            key={row.term}
            className="border-b border-rule py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-[minmax(0,220px)_1fr] gap-2 sm:gap-8"
          >
            <dt className="font-display text-lg text-ink">{t(row.term)}</dt>
            <dd className="text-sm sm:text-[15px] text-ink-soft leading-relaxed m-0">
              {t(row.def)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
