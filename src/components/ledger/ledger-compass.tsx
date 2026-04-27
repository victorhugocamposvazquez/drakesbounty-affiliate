import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CompassItem } from "@/lib/ledger/compass";

export async function LedgerCompass({ items }: { items: CompassItem[] }) {
  const t = await getTranslations("Ledger");
  if (items.length === 0) return null;

  return (
    <section
      className="border border-oxblood/25 bg-gradient-to-br from-oxblood/[0.07] to-transparent p-4 sm:p-6 mb-8 sm:mb-10"
      aria-labelledby="ledger-compass-heading"
    >
      <p className="eyebrow text-oxblood mb-1">{t("compassOverline")}</p>
      <h2
        id="ledger-compass-heading"
        className="font-display text-xl sm:text-2xl mb-1"
        style={{ fontVariationSettings: '"opsz" 72' }}
      >
        {t("compassTitle")}
      </h2>
      <p className="text-sm text-ink-soft mb-5 max-w-2xl">{t("compassIntro")}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((row) => (
          <li key={row.id}>
            <Link
              href={row.href}
              prefetch
              className="block h-full border border-rule bg-paper/40 p-4 transition-colors hover:border-oxblood/50 hover:bg-paper-warm/20"
            >
              <p className="font-display text-lg text-ink mb-1.5">
                {t(`compassItems.${row.id}.title`)}
              </p>
              <p className="text-xs text-ink-soft leading-relaxed mb-3">
                {t(`compassItems.${row.id}.body`)}
              </p>
              <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-oxblood">
                {t(`compassItems.${row.id}.cta`)} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
