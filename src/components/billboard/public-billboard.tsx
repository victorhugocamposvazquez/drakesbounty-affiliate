import { getTranslations } from "next-intl/server";
import { absoluteUrl } from "@/lib/env";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/brand-mark";

type BountyRow = {
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

export async function PublicBillboard({
  displayName,
  handle,
  heroTitle,
  heroSub,
  campaigns,
}: {
  displayName: string;
  handle: string;
  heroTitle: string;
  heroSub: string;
  campaigns: BountyRow[];
}) {
  const t = await getTranslations("PublicBillboard");
  const active = campaigns.filter(
    (c) => c.bounties && c.bounties.status === "active",
  );

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(255, 0, 110, 0.25) 0%, transparent 50%),
            linear-gradient(180deg, #0c051a 0%, #15082a 40%, #06010f 100%)`,
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[300vw] h-[50vh] opacity-60 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 0, 110, 0.2) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          transform: "translateX(-50%) perspective(500px) rotateX(62deg)",
          transformOrigin: "center top",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] mix-blend-multiply opacity-70 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.12)_2px,rgba(0,0,0,0.12)_3px)]" />

      <header className="relative z-10 border-b border-[#ff006e]/25 px-5 py-4 sm:px-8 flex items-center justify-between gap-4 backdrop-blur-sm bg-[#0c051a]/40">
        <div className="flex items-center gap-3 min-w-0">
          <BrandMark size={32} className="text-[#00ffff] shrink-0" />
          <div className="min-w-0">
            <p
              className="[font-family:var(--font-crt)] text-2xl sm:text-3xl text-[#ffbe0b] leading-none tracking-wide truncate"
            >
              {displayName}
            </p>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#b8a5d6]">
              {t("byline", { handle: `@${handle}` })}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#8338ec]">
            {t("badge")}
          </p>
        </div>
      </header>

      <section className="relative z-10 px-5 sm:px-8 pt-12 sm:pt-20 pb-10 max-w-4xl">
        <h1
          className="[font-family:var(--font-crt)] text-4xl sm:text-5xl md:text-6xl text-[#00ffff] drop-shadow-[0_0_18px_rgba(0,255,255,0.4)] leading-[1.05] mb-4"
        >
          {heroTitle || t("defaultHeadline")}
        </h1>
        <p className="text-lg sm:text-xl text-[#f0e4ff]/80 max-w-2xl leading-relaxed mb-2">
          {heroSub || t("defaultSubline")}
        </p>
      </section>

      <section className="relative z-10 px-5 sm:px-8 pb-24 max-w-5xl">
        <h2 className="[font-family:var(--font-crt)] text-2xl sm:text-3xl text-[#ff006e] mb-8">
          {t("openCampaigns")}
        </h2>
        {active.length === 0 ? (
          <p className="text-[#b8a5d6] font-mono text-sm">
            {t("emptyState")}
          </p>
        ) : (
          <ul className="space-y-6">
            {active.map((c) => {
              const b = c.bounties;
              if (!b) return null;
              const title = c.custom_title || b.title;
              const desc = c.custom_message || b.description || "";
              const href = absoluteUrl(`/api/r?bc=${c.id}`);
              return (
                <li
                  key={c.id}
                  className={`group border border-[#00ffff]/30 bg-gradient-to-r from-[#15082a] to-[#0c051a] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(131,56,236,0.2)] ${
                    c.featured
                      ? "ring-1 ring-[#ffbe0b]/50"
                      : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="[font-family:var(--font-crt)] text-2xl text-[#ffbe0b] mb-1">
                        {title}
                      </h3>
                      {desc && (
                        <p className="text-[#d8c4f0] text-sm max-w-2xl leading-relaxed line-clamp-3">
                          {desc}
                        </p>
                      )}
                      <PayoutPill model={b.payout_model} b={b} t={t} />
                    </div>
                    <a
                      href={href}
                      className="shrink-0 inline-flex items-center justify-center [font-family:var(--font-crt)] text-xl sm:text-2xl px-6 py-3 bg-[#ff006e] text-white hover:bg-[#c8005a] transition-colors"
                    >
                      {t("cta")}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="relative z-10 border-t border-[#ff006e]/20 px-5 py-8 text-center">
        <p className="text-[#6b5a8a] text-xs font-mono tracking-widest">
          {t("footer", { year: "MMXXVI" })}
        </p>
        <Link
          href="/"
          className="inline-block mt-3 text-[#00ffff] text-sm font-mono hover:underline"
        >
          {t("backDrake")} →
        </Link>
      </footer>
    </div>
  );
}

function PayoutPill({
  model,
  b,
  t,
}: {
  model: string;
  b: BountyRow["bounties"];
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  if (!b) return null;
  if (model === "cpa" && b.cpa_amount_cents != null) {
    const eur = (b.cpa_amount_cents / 100).toFixed(0);
    return (
      <p className="mt-2 font-mono text-xs text-[#00ffff]">
        {t("payoutCpa", { amount: eur, currency: b.currency || "EUR" })}
      </p>
    );
  }
  if (model === "revshare" && b.revshare_pct != null) {
    return (
      <p className="mt-2 font-mono text-xs text-[#00ffff]">
        {t("payoutRev", { pct: String(b.revshare_pct) })}
      </p>
    );
  }
  return null;
}
