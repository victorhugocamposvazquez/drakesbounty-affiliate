import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

const ROMAN = ["I", "II", "III", "IV", "V"];

export default async function CodePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Code");
  const tBrand = await getTranslations("Brand");

  // Arrays loaded from messages (typed loosely on purpose — content is editorial).
  const creatorArticles = (await getMessagesArray(locale, "Code.creatorArticles")) as Article[];
  const operatorArticles = (await getMessagesArray(locale, "Code.operatorArticles")) as Article[];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* MASTHEAD */}
      <section className="border-b border-rule">
        <div className="max-w-[900px] mx-auto px-8 pt-20 pb-16 text-center">
          <p className="eyebrow mb-4">{t("edition")}</p>
          <h1
            className="font-display text-7xl md:text-8xl leading-[0.95] tracking-tight"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {t("title")}
          </h1>
          <p className="mt-6 font-display italic text-xl text-ink-soft">
            {t("subtitle")}
          </p>
          <div className="mt-10 inline-flex items-center gap-4">
            <button
              className="inline-flex items-center gap-3 border border-ink/40 px-5 py-2.5 font-mono text-[10px] tracking-[0.28em] uppercase hover:border-oxblood hover:text-oxblood transition-colors disabled:opacity-50"
              disabled
              title="Coming soon"
            >
              <DownloadIcon />
              {t("downloadPdf")}
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-[900px] mx-auto w-full px-8 py-16">
        {/* TABLE OF CONTENTS */}
        <aside className="mb-20 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 border-y border-rule py-6">
          <p className="col-span-full eyebrow mb-2">{t("tocLabel")}</p>
          <TocLink href="#preamble" label={t("toc.preamble")} num="—" />
          <TocLink href="#operator" label={t("toc.operator")} num="I" />
          <TocLink href="#creator" label={t("toc.creator")} num="II" />
          <TocLink href="#house" label={t("toc.house")} num="III" />
          <TocLink href="#enforcement" label={t("toc.enforcement")} num="IV" />
          <TocLink href="#spirit" label={t("toc.spirit")} num="V" />
        </aside>

        {/* PREAMBLE */}
        <Section id="preamble" title={t("preambleTitle")} number="—">
          <p className="font-display italic text-[19px] leading-[1.7] text-ink-soft">
            {t("preambleBody")}
          </p>
        </Section>

        {/* OPERATOR'S OATH */}
        <Section id="operator" title={t("operatorTitle")} number="I">
          <p className="text-ink-dim mb-10 max-w-2xl">{t("operatorIntro")}</p>
          <ArticleList items={operatorArticles} t={t} />
        </Section>

        {/* CREATOR'S OATH */}
        <Section id="creator" title={t("creatorTitle")} number="II">
          <p className="text-ink-dim mb-10 max-w-2xl">{t("creatorIntro")}</p>
          <ArticleList items={creatorArticles} t={t} />
        </Section>

        {/* HOUSE OBLIGATIONS */}
        <Section id="house" title={t("houseTitle")} number="III">
          <p className="text-ink-dim mb-6 max-w-2xl">{t("houseIntro")}</p>
          <p className="font-display text-[17px] leading-[1.75] text-ink-soft">
            {t("houseBody")}
          </p>
        </Section>

        {/* ENFORCEMENT */}
        <Section id="enforcement" title={t("enforcementTitle")} number="IV">
          <p className="font-display text-[17px] leading-[1.75] text-ink-soft">
            {t("enforcementBody")}
          </p>
        </Section>

        {/* SPIRIT */}
        <Section id="spirit" title={t("spiritTitle")} number="V">
          <p className="font-display italic text-[19px] leading-[1.75] text-ink-soft">
            {t("spiritBody")}
          </p>
        </Section>

        {/* CTA — sign the oath */}
        <div className="mt-24 border-t border-rule pt-16 text-center">
          <p className="font-display italic text-2xl text-ink-soft mb-8">
            “{t("subtitle")}”
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/oath/creator"
              className="inline-flex items-center gap-3 bg-oxblood text-paper px-6 py-3 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-oxblood-deep transition-colors"
            >
              {tBrand("wordmark")} · sign as creator
            </Link>
            <Link
              href="/oath/operator"
              className="inline-flex items-center gap-3 border border-ink/40 px-6 py-3 font-mono text-[10px] tracking-[0.28em] uppercase hover:border-oxblood hover:text-oxblood transition-colors"
            >
              sign as operator
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-rule mt-16">
        <div className="max-w-[1400px] mx-auto px-8 py-8 text-center font-mono text-[9px] tracking-[0.3em] uppercase text-ink-faint">
          {tBrand("wordmark")} {tBrand("wordmarkItalic")} · {tBrand("tagline")}
        </div>
      </footer>
    </div>
  );
}

/* ============ Helpers ============ */

type Article = { title: string; body: string };

async function getMessagesArray(locale: string, path: string): Promise<unknown[]> {
  // We bypass the t() API for arrays — load the raw JSON file.
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const segments = path.split(".");
  let cursor: unknown = messages;
  for (const seg of segments) {
    if (cursor && typeof cursor === "object" && seg in (cursor as object)) {
      cursor = (cursor as Record<string, unknown>)[seg];
    } else {
      return [];
    }
  }
  return Array.isArray(cursor) ? cursor : [];
}

function Section({
  id,
  title,
  number,
  children,
}: {
  id: string;
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-24 scroll-mt-24">
      <div className="flex items-baseline gap-6 mb-8">
        <span
          className="roman text-5xl leading-none"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {number}.
        </span>
        <h2
          className="font-display text-3xl md:text-4xl"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {title}
        </h2>
      </div>
      <div className="pl-0 md:pl-16">{children}</div>
    </section>
  );
}

function ArticleList({
  items,
  t,
}: {
  items: Article[];
  t: (key: string) => string;
}) {
  return (
    <ol className="space-y-8">
      {items.map((art, i) => (
        <li
          key={i}
          className="flex gap-6 border-l-2 border-rule pl-6 hover:border-oxblood transition-colors"
        >
          <span
            className="roman text-2xl leading-none w-8 flex-none -ml-12 text-right"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {ROMAN[i]}.
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl mb-2 font-medium">
              {art.title}
            </h3>
            <p className="text-ink-soft leading-relaxed">{art.body}</p>
            <p className="mt-3 font-mono text-[9px] tracking-[0.28em] uppercase text-ink-faint">
              {t("auditMark")} · Q · {ROMAN[i]}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TocLink({
  href,
  label,
  num,
}: {
  href: string;
  label: string;
  num: string;
}) {
  return (
    <a
      href={href}
      className="flex items-baseline gap-3 text-ink-dim hover:text-oxblood transition-colors group"
    >
      <span className="roman text-sm w-6">{num}</span>
      <span className="font-display text-[15px] underline-offset-4 group-hover:underline">
        {label}
      </span>
    </a>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1v8m0 0L4 6m3 3l3-3M2 11h10"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
