"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { absoluteUrl } from "@/lib/env";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/brand-mark";
import type { BillboardTheme } from "@/lib/billboard-theme";

export type BillboardCampaignView = {
  id: string;
  position: number;
  featured: boolean;
  custom_title: string | null;
  custom_message: string | null;
  bounties: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    payout_model: string;
    cpa_amount_cents: number | null;
    revshare_pct: string | null;
    currency: string;
  } | null;
};

type Props = {
  theme: BillboardTheme;
  displayName: string;
  handle: string;
  heroTitle: string;
  heroSub: string;
  campaigns: BillboardCampaignView[];
  /** Profile avatar URL; when empty, Drake seal is used. */
  avatarUrl: string | null;
  /** Tighter layout for editor thumbnails. */
  compact?: boolean;
  /**
   * In the Ledger live preview: no `fixed` backgrounds (avoids full-viewport paint),
   * no navigation from CTA/footer links.
   */
  contained?: boolean;
};

function CtaOrPreviewLink({
  href,
  contained,
  className,
  children,
}: {
  href: string;
  contained: boolean;
  className: string;
  children: ReactNode;
}) {
  if (contained) {
    return (
      <span className={className} title="Preview: links are active on the public page only.">
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function FooterBackLink({
  contained,
  className,
  children,
}: {
  contained: boolean;
  className: string;
  children: ReactNode;
}) {
  if (contained) {
    return (
      <span className={className} title="Preview only — link on the public page.">
        {children}
      </span>
    );
  }
  return (
    <Link href="/" className={className}>
      {children}
    </Link>
  );
}

function LogoOrAvatar({
  avatarUrl,
  theme,
  size = 40,
}: {
  avatarUrl: string | null;
  theme: BillboardTheme;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      // Remote avatar (Supabase storage / OAuth); domains vary per project
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-cover rounded-full border-2 ${
          theme === "minimal"
            ? "border-slate-500"
            : theme === "broadsheet"
              ? "border-stone-800"
              : "border-cyan-400/50"
        }`}
      />
    );
  }
  return (
    <BrandMark
      size={size}
      className={
        theme === "minimal"
          ? "text-cyan-400/90"
          : theme === "broadsheet"
            ? "text-stone-800"
            : "text-[#00ffff]"
      }
    />
  );
}

function PayoutLine({
  theme,
  model,
  b,
  t,
}: {
  theme: BillboardTheme;
  model: string;
  b: BillboardCampaignView["bounties"];
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  if (!b) return null;
  const cls =
    theme === "minimal"
      ? "mt-2 font-mono text-xs text-emerald-300/90"
      : theme === "broadsheet"
        ? "mt-2 font-mono text-xs text-stone-600"
        : "mt-2 font-mono text-xs text-[#00ffff]";
  if (model === "cpa" && b.cpa_amount_cents != null) {
    const eur = (b.cpa_amount_cents / 100).toFixed(0);
    return (
      <p className={cls}>
        {t("payoutCpa", { amount: eur, currency: b.currency || "EUR" })}
      </p>
    );
  }
  if (model === "revshare" && b.revshare_pct != null) {
    return (
      <p className={cls}>
        {t("payoutRev", { pct: String(b.revshare_pct) })}
      </p>
    );
  }
  return null;
}

export function BillboardFrame({
  theme,
  displayName,
  handle,
  heroTitle,
  heroSub,
  campaigns,
  avatarUrl,
  compact = false,
  contained = false,
}: Props) {
  const t = useTranslations("PublicBillboard");
  const active = campaigns.filter(
    (c) => c.bounties && c.bounties.status === "active",
  );

  const title = heroTitle || t("defaultHeadline");
  const sub = heroSub || t("defaultSubline");

  if (theme === "minimal") {
    return (
      <div
        className={
          compact
            ? "min-h-0 text-slate-100 font-sans"
            : contained
              ? "min-h-0 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans"
              : "min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans"
        }
      >
        <header
          className={`border-b border-slate-700/80 ${compact ? "px-3 py-2" : "px-5 py-4 sm:px-8"} flex items-center justify-between gap-3 bg-slate-950/60 backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <LogoOrAvatar avatarUrl={avatarUrl} theme={theme} size={compact ? 28 : 40} />
            <div className="min-w-0">
              <p
                className={`font-semibold tracking-tight truncate ${compact ? "text-sm" : "text-lg sm:text-xl"}`}
              >
                {displayName}
              </p>
              <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500">
                {t("byline", { handle: `@${handle}` })}
              </p>
            </div>
          </div>
          <p className="font-mono text-[8px] uppercase text-slate-500 shrink-0 hidden sm:block">
            {t("badge")}
          </p>
        </header>
        <section className={compact ? "px-3 py-3 max-w-lg" : "px-5 sm:px-8 pt-10 sm:pt-16 pb-8 max-w-3xl"}>
          <h1
            className={
              compact
                ? "text-lg font-semibold text-white mb-1 leading-tight"
                : "text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-3 leading-tight"
            }
          >
            {title}
          </h1>
          <p
            className={
              compact
                ? "text-xs text-slate-400 leading-snug"
                : "text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
            }
          >
            {sub}
          </p>
        </section>
        <section className={compact ? "px-3 pb-4 max-w-lg" : "px-5 sm:px-8 pb-20 max-w-4xl"}>
          <h2
            className={
              compact
                ? "text-xs font-semibold text-slate-400 mb-2"
                : "text-lg sm:text-xl font-semibold text-slate-300 mb-4"
            }
          >
            {t("openCampaigns")}
          </h2>
          {active.length === 0 ? (
            <p className="text-slate-500 font-mono text-xs">{t("emptyState")}</p>
          ) : (
            <ul className={compact ? "space-y-2" : "space-y-4"}>
              {active.map((c) => {
                const b = c.bounties;
                if (!b) return null;
                const cardTitle = c.custom_title || b.title;
                const desc = c.custom_message || b.description || "";
                const href = absoluteUrl(`/api/r?bc=${c.id}`);
                return (
                  <li
                    key={c.id}
                    className={`rounded-lg border border-slate-600/80 bg-slate-900/40 p-3 ${compact ? "" : "p-5 sm:p-6"}`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-emerald-100/95 text-base">
                          {cardTitle}
                        </h3>
                        {desc && (
                          <p className="text-slate-400 text-sm mt-1 line-clamp-3">
                            {desc}
                          </p>
                        )}
                        <PayoutLine
                          theme={theme}
                          model={b.payout_model}
                          b={b}
                          t={t}
                        />
                      </div>
                      <CtaOrPreviewLink
                        href={href}
                        contained={contained}
                        className="shrink-0 inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-md border border-emerald-400/60 text-emerald-200 hover:bg-emerald-950/80"
                      >
                        {t("cta")}
                      </CtaOrPreviewLink>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        {!compact && (
          <footer className="border-t border-slate-800 px-5 py-6 text-center">
            <p className="text-slate-600 text-xs font-mono tracking-widest">
              {t("footer", { year: "MMXXVI" })}
            </p>
            <FooterBackLink
              contained={contained}
              className="inline-block mt-2 text-emerald-400/80 text-sm font-mono hover:underline"
            >
              {t("backDrake")} →
            </FooterBackLink>
          </footer>
        )}
      </div>
    );
  }

  if (theme === "broadsheet") {
    return (
      <div
        className={
          compact
            ? "min-h-0 bg-[#f0ebe3] text-stone-900 font-serif"
            : contained
              ? "min-h-0 relative overflow-hidden bg-[#ebe4d8] text-stone-900 font-serif"
              : "min-h-screen relative overflow-hidden bg-[#ebe4d8] text-stone-900 font-serif"
        }
      >
        <div
          className={
            compact ? "border-b-2 border-stone-900 px-3 py-2" : "border-b-4 border-stone-900 px-5 py-4 sm:px-8"
          }
        >
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <LogoOrAvatar avatarUrl={avatarUrl} theme={theme} size={compact ? 28 : 40} />
              <div className="min-w-0">
                <p
                  className={`font-bold tracking-tight uppercase ${compact ? "text-sm" : "text-xl sm:text-2xl"}`}
                >
                  {displayName}
                </p>
                <p className="font-mono text-[8px] tracking-widest text-stone-600">
                  {t("byline", { handle: `@${handle}` })}
                </p>
              </div>
            </div>
            <p className="font-mono text-[8px] uppercase tracking-widest text-stone-600 hidden sm:block">
              {t("badge")}
            </p>
          </div>
        </div>
        <section
          className={
            compact ? "px-3 py-3 max-w-lg mx-auto" : "max-w-3xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-8"
          }
        >
          <h1
            className={
              compact
                ? "text-xl font-black leading-tight mb-1 border-b-2 border-stone-900 pb-1"
                : "text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] mb-4 border-b-4 border-stone-900 pb-3"
            }
          >
            {title}
          </h1>
          <p
            className={
              compact
                ? "text-xs text-stone-700 leading-snug"
                : "text-lg sm:text-xl text-stone-800 max-w-2xl leading-relaxed"
            }
          >
            {sub}
          </p>
        </section>
        <section
          className={
            compact ? "px-3 pb-4 max-w-lg mx-auto" : "max-w-4xl mx-auto px-5 sm:px-8 pb-24"
          }
        >
          <h2
            className={
              compact
                ? "text-xs font-bold uppercase tracking-widest mb-2"
                : "text-xl font-bold uppercase tracking-widest mb-6"
            }
          >
            {t("openCampaigns")}
          </h2>
          {active.length === 0 ? (
            <p className="text-stone-600 font-mono text-xs">{t("emptyState")}</p>
          ) : (
            <ul className="space-y-4 sm:space-y-6">
              {active.map((c) => {
                const b = c.bounties;
                if (!b) return null;
                const cardTitle = c.custom_title || b.title;
                const desc = c.custom_message || b.description || "";
                const href = absoluteUrl(`/api/r?bc=${c.id}`);
                return (
                  <li
                    key={c.id}
                    className="border-b-2 border-stone-400 pb-4 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-1">
                          {cardTitle}
                        </h3>
                        {desc && (
                          <p className="text-stone-700 text-sm max-w-2xl leading-relaxed line-clamp-3">
                            {desc}
                          </p>
                        )}
                        <PayoutLine
                          theme={theme}
                          model={b.payout_model}
                          b={b}
                          t={t}
                        />
                      </div>
                      <CtaOrPreviewLink
                        href={href}
                        contained={contained}
                        className="shrink-0 inline-flex items-center justify-center text-sm sm:text-base font-bold px-5 py-2.5 bg-stone-900 text-[#f0ebe3] rounded-full hover:bg-stone-800"
                      >
                        {t("cta")}
                      </CtaOrPreviewLink>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        {!compact && (
          <footer className="border-t-2 border-stone-900 px-5 py-6 text-center">
            <p className="text-stone-600 text-xs font-mono tracking-widest">
              {t("footer", { year: "MMXXVI" })}
            </p>
            <FooterBackLink
              contained={contained}
              className="inline-block mt-2 text-stone-800 text-sm font-mono hover:underline"
            >
              {t("backDrake")} →
            </FooterBackLink>
          </footer>
        )}
      </div>
    );
  }

  // retrowave (default)
  const retroPos = contained ? "absolute" : "fixed";
  return (
    <div
      className={
        compact
          ? "min-h-0 font-sans text-inherit"
          : contained
            ? "relative min-h-0 overflow-hidden font-sans"
            : "min-h-screen relative overflow-hidden font-sans"
      }
    >
      <div
        className={`pointer-events-none ${retroPos} inset-0 z-0`}
        style={{
          background: compact
            ? "linear-gradient(180deg, #0c051a 0%, #15082a 50%, #06010f 100%)"
            : `
            radial-gradient(ellipse at 50% 0%, rgba(255, 0, 110, 0.25) 0%, transparent 50%),
            linear-gradient(180deg, #0c051a 0%, #15082a 40%, #06010f 100%)`,
        }}
      />
      {!compact && (
        <>
          <div
            className={`pointer-events-none ${retroPos} bottom-0 left-1/2 -translate-x-1/2 w-[300vw] opacity-60 z-0 ${
              contained
                ? "h-[min(40%,8rem)] max-h-36"
                : "h-[50vh]"
            }`}
            style={{
              backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 0, 110, 0.2) 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
              transform: "translateX(-50%) perspective(500px) rotateX(62deg)",
              transformOrigin: "center top",
            }}
          />
          <div
            className={`pointer-events-none ${retroPos} inset-0 z-[1] mix-blend-multiply opacity-70 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.12)_2px,rgba(0,0,0,0.12)_3px)]`}
          />
        </>
      )}

      <header
        className={`relative z-10 border-b border-[#ff006e]/25 flex items-center justify-between gap-4 backdrop-blur-sm bg-[#0c051a]/40 ${compact ? "px-3 py-2" : "px-5 py-4 sm:px-8"}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <LogoOrAvatar avatarUrl={avatarUrl} theme="retrowave" size={compact ? 28 : 32} />
          <div className="min-w-0">
            <p
              className={`[font-family:var(--font-crt)] text-[#ffbe0b] leading-none tracking-wide truncate ${compact ? "text-base" : "text-2xl sm:text-3xl"}`}
            >
              {displayName}
            </p>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#b8a5d6]">
              {t("byline", { handle: `@${handle}` })}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right hidden sm:block">
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#8338ec]">
            {t("badge")}
          </p>
        </div>
      </header>

      <section
        className={
          compact
            ? "relative z-10 px-3 py-3 max-w-md"
            : "relative z-10 px-5 sm:px-8 pt-12 sm:pt-20 pb-10 max-w-4xl"
        }
      >
        <h1
          className={`[font-family:var(--font-crt)] text-[#00ffff] drop-shadow-[0_0_18px_rgba(0,255,255,0.4)] leading-[1.05] mb-2 ${compact ? "text-lg" : "text-4xl sm:text-5xl md:text-6xl"}`}
        >
          {title}
        </h1>
        <p
          className={
            compact
              ? "text-xs text-[#f0e4ff]/80 leading-snug"
              : "text-lg sm:text-xl text-[#f0e4ff]/80 max-w-2xl leading-relaxed"
          }
        >
          {sub}
        </p>
      </section>

      <section
        className={
          compact
            ? "relative z-10 px-3 pb-4 max-w-lg"
            : "relative z-10 px-5 sm:px-8 pb-24 max-w-5xl"
        }
      >
        <h2
          className={`[font-family:var(--font-crt)] text-[#ff006e] ${compact ? "text-sm mb-3" : "text-2xl sm:text-3xl mb-8"}`}
        >
          {t("openCampaigns")}
        </h2>
        {active.length === 0 ? (
          <p className="text-[#b8a5d6] font-mono text-xs">
            {t("emptyState")}
          </p>
        ) : (
          <ul className={compact ? "space-y-3" : "space-y-6"}>
            {active.map((c) => {
              const b = c.bounties;
              if (!b) return null;
              const cardTitle = c.custom_title || b.title;
              const desc = c.custom_message || b.description || "";
              const href = absoluteUrl(`/api/r?bc=${c.id}`);
              return (
                <li
                  key={c.id}
                  className={`group border border-[#00ffff]/30 bg-gradient-to-r from-[#15082a] to-[#0c051a] shadow-[0_0_0_1px_rgba(131,56,236,0.2)] ${
                    compact ? "p-3" : "p-5 sm:p-6"
                  } ${c.featured ? "ring-1 ring-[#ffbe0b]/50" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3
                        className={`[font-family:var(--font-crt)] text-[#ffbe0b] ${compact ? "text-base" : "text-2xl"}`}
                      >
                        {cardTitle}
                      </h3>
                      {desc && (
                        <p className="text-[#d8c4f0] text-xs sm:text-sm max-w-2xl leading-relaxed line-clamp-3">
                          {desc}
                        </p>
                      )}
                      <PayoutLine
                        theme="retrowave"
                        model={b.payout_model}
                        b={b}
                        t={t}
                      />
                    </div>
                    <CtaOrPreviewLink
                      href={href}
                      contained={contained}
                      className="shrink-0 inline-flex items-center justify-center [font-family:var(--font-crt)] text-sm sm:text-xl px-4 py-2 sm:px-6 sm:py-3 bg-[#ff006e] text-white hover:bg-[#c8005a]"
                    >
                      {t("cta")}
                    </CtaOrPreviewLink>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!compact && (
        <footer className="relative z-10 border-t border-[#ff006e]/20 px-5 py-8 text-center">
          <p className="text-[#6b5a8a] text-xs font-mono tracking-widest">
            {t("footer", { year: "MMXXVI" })}
          </p>
          <FooterBackLink
            contained={contained}
            className="inline-block mt-3 text-[#00ffff] text-sm font-mono hover:underline"
          >
            {t("backDrake")} →
          </FooterBackLink>
        </footer>
      )}
    </div>
  );
}
