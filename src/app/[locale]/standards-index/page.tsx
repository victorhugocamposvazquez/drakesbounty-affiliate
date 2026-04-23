import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

export default async function StandardsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("StandardsIndex");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-8 py-20">
        <p className="eyebrow mb-3 text-oxblood">{t("overline")}</p>
        <h1
          className="font-display text-4xl md:text-5xl mb-4"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("title")}
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-8">{t("body")}</p>
        <Link
          href="/"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim"
        >
          ← {t("back")}
        </Link>
      </main>
    </div>
  );
}
