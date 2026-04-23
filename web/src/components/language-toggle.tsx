"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next as (typeof routing.locales)[number] });
    });
  };

  return (
    <div
      className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.28em] uppercase"
      aria-busy={isPending}
    >
      {routing.locales.map((code, i) => (
        <span key={code} className="inline-flex items-center">
          {i > 0 && <span className="text-ink-faint/60 mx-1">·</span>}
          <button
            onClick={() => switchTo(code)}
            className={`px-1.5 py-0.5 transition-colors ${
              code === locale
                ? "text-oxblood"
                : "text-ink-faint hover:text-ink"
            }`}
            aria-current={code === locale ? "true" : undefined}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
