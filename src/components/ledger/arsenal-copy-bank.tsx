"use client";

import { useTranslations } from "next-intl";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard-button";

type Item = { title: string; body: string };

export function ArsenalCopyBank({ items }: { items: Item[] }) {
  const t = useTranslations("Ledger");
  return (
    <section className="border border-oxblood/20 bg-oxblood/[0.04] p-5 sm:p-6 mb-10" aria-label={t("arsenalCopyK")}>
      <p className="eyebrow text-oxblood mb-2">{t("arsenalCopyK")}</p>
      <p className="text-sm text-ink-soft mb-6 max-w-2xl">{t("arsenalCopyIntro")}</p>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.title}
            className="border border-rule/80 bg-paper/30 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                {item.body}
              </p>
            </div>
            <CopyToClipboardButton
              text={item.body}
              label={t("arsenalCopyCta")}
              copiedLabel={t("arsenalCopyCopied")}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
