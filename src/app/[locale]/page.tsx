import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

export default async function ThresholdPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Threshold");
  const tBrand = await getTranslations("Brand");

  // Split the founder body around {highlight} to render it inline.
  const founderBody = t("founderNoteBody", {
    highlight: `¦${t("founderNoteHighlight")}¦`,
  });
  const [founderPre, founderHl, founderPost] = founderBody.split("¦");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* ============ HERO ============ */}
      <section className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Founder's Note */}
        <div className="max-w-xl">
          <p className="eyebrow mb-6">{t("overline")}</p>
          <h1
            className="font-display text-6xl lg:text-7xl leading-[1.02] tracking-tight mb-8"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {t("title")}{" "}
            <em className="italic text-oxblood">{t("titleItalic")}</em>{" "}
            {t("titleSuffix")}
          </h1>
          <p className="font-display text-xl leading-relaxed text-ink-soft mb-12 italic max-w-lg">
            {t("lead")}
          </p>

          <div className="border-t border-rule pt-8">
            <p className="eyebrow mb-4">{t("founderNoteLabel")}</p>
            <p className="font-display text-[17px] leading-[1.7] text-ink-soft">
              <span className="float-left font-display text-[72px] leading-[0.85] text-oxblood pr-3 pt-1">
                {t("founderNoteDropcap")}
              </span>
              {founderPre}
              <span className="bg-brass-light/40 px-0.5">{founderHl}</span>
              {founderPost}
            </p>
            <div className="mt-6 font-display italic text-ink-dim">
              {t("signatureName")}
              <span className="block text-sm text-ink-faint not-italic mt-1">
                {t("signatureRole")}
              </span>
            </div>
          </div>
        </div>

        {/* Oath choice */}
        <div className="lg:pl-8 lg:border-l lg:border-rule flex flex-col justify-center">
          <div className="mb-10">
            <h2
              className="font-display text-3xl mb-2"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {t("chooseTitle")}
            </h2>
            <p className="text-ink-faint">{t("chooseSubtitle")}</p>
          </div>

          <div className="space-y-6">
            <OathOption
              roman="I."
              title={t("creatorLabel")}
              desc={t("creatorDesc")}
              cta={t("ctaEnter")}
              href="/oath/creator"
            />
            <OathOption
              roman="II."
              title={t("operatorLabel")}
              desc={t("operatorDesc")}
              cta={t("ctaEnter")}
              href="/oath/operator"
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/code"
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-oxblood transition-colors underline-offset-4 hover:underline"
            >
              {t("ctaReadCode")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <footer className="border-t border-rule">
        <div className="max-w-[1400px] mx-auto px-8 py-10 flex items-center justify-between text-sm text-ink-faint">
          <div className="font-display italic text-ink-dim text-base">
            {t("closingQuote")}{" "}
            <span className="not-italic ml-2">{t("closingAttribution")}</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase">
            {tBrand("tagline")}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ========== Inline presentational components ========== */

function OathOption({
  roman,
  title,
  desc,
  cta,
  href,
}: {
  roman: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border border-rule hover:border-oxblood transition-colors duration-300 p-8 relative bg-paper-warm/30"
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-0 bg-oxblood group-hover:w-1 transition-all duration-300"
        aria-hidden
      />
      <div className="flex items-start gap-6">
        <span className="roman text-4xl leading-none">{roman}</span>
        <div className="flex-1">
          <h3 className="font-display text-2xl font-medium mb-2 group-hover:text-oxblood transition-colors">
            {title}
          </h3>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-4">
            {desc}
          </p>
          <span className="eyebrow text-oxblood group-hover:tracking-[0.4em] transition-all">
            {cta} →
          </span>
        </div>
      </div>
    </Link>
  );
}
