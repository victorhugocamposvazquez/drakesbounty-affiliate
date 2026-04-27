"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { BillboardFrame } from "@/components/billboard/billboard-frame";
import { BillboardThemeMini } from "@/components/billboard/billboard-theme-mini";
import type { BillboardCampaignView } from "@/components/billboard/billboard-frame";
import type { BillboardTheme } from "@/lib/billboard-theme";
import { BILLBOARD_THEMES } from "@/lib/billboard-theme";
import { saveBillboardSettings } from "@/lib/ledger/billboard-actions";

const THEMES: BillboardTheme[] = [...BILLBOARD_THEMES];

export function BillboardEditorForm({
  initialHeadline,
  initialSubline,
  initialPublished,
  initialTheme,
  publicUrl,
  handle,
  displayName,
  avatarUrl,
}: {
  initialHeadline: string;
  initialSubline: string;
  initialPublished: boolean;
  initialTheme: BillboardTheme;
  publicUrl: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const t = useTranslations("Billboard");
  const tPublic = useTranslations("PublicBillboard");
  const locale = useLocale() as "en" | "es";
  const [headline, setHeadline] = useState(initialHeadline);
  const [subline, setSubline] = useState(initialSubline);
  const [published, setPublished] = useState(initialPublished);
  const [theme, setTheme] = useState<BillboardTheme>(initialTheme);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  const previewCampaigns: BillboardCampaignView[] = useMemo(
    () => [
      {
        id: "preview-campaign",
        position: 0,
        featured: true,
        custom_title: null,
        custom_message: null,
        bounties: {
          id: "preview-bounty",
          title: t("previewBountyTitle"),
          description: t("previewBountyBody"),
          status: "active",
          payout_model: "cpa",
          cpa_amount_cents: 5000,
          revshare_pct: null,
          currency: "EUR",
        },
      },
    ],
    [t],
  );

  const onSave = useCallback(() => {
    setErr(null);
    setOk(false);
    start(async () => {
      const res = await saveBillboardSettings({
        locale,
        headline,
        subline,
        published,
        theme,
      });
      if (!res.ok) {
        if (res.error === "not_creator") setErr(t("errorNotCreator"));
        else if (res.error === "unauthorized")
          setErr(t("errorUnauthorized"));
        else if (res.error === "invalid_input") setErr(t("errorInvalidInput"));
        else setErr(res.error);
        return;
      }
      setOk(true);
    });
  }, [headline, locale, published, subline, t, theme]);

  return (
    <div className="max-w-4xl space-y-8 sm:space-y-10 text-ink">
      <div className="border border-rule bg-paper-warm/20 p-4 sm:p-5">
        <p className="eyebrow mb-2 text-ink-faint">{t("publicUrlLabel")}</p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm text-oxblood hover:underline break-all"
        >
          {publicUrl}
        </a>
        <p className="text-xs text-ink-faint mt-2">
          {t("publicUrlHelp", { handle: `@${handle}` })}
        </p>
      </div>

      <div>
        <p className="eyebrow text-ink-faint mb-2">{t("themePickerLabel")}</p>
        <p className="text-sm text-ink-soft mb-4 max-w-2xl">{t("themePickerHelp")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              className={`text-left rounded-t border-2 transition-colors overflow-hidden bg-paper/30 shadow-sm ${
                theme === id
                  ? "border-oxblood ring-2 ring-oxblood/20"
                  : "border-rule/50 hover:border-rule"
              }`}
            >
              <p className="px-2 pt-2 pb-1 font-mono text-[9px] uppercase tracking-widest text-ink-dim">
                {t(`themeName_${id}` as "themeName_retrowave")}
              </p>
              <p className="px-2 pb-1 text-xs text-ink-faint line-clamp-2">
                {t(`themeBlurb_${id}` as "themeBlurb_retrowave")}
              </p>
              <div className="w-full border-t border-rule/40 p-0">
                <BillboardThemeMini
                  theme={id}
                  displayName={displayName}
                  handle={handle}
                  heroTitle={headline}
                  heroSub={subline}
                  avatarUrl={avatarUrl}
                  sampleBountyLine={t("miniSampleOffer")}
                  ctaLabel={tPublic("cta")}
                />
              </div>
              <p className="px-2 py-1.5 text-[9px] font-mono text-ink-faint text-center border-t border-rule/30">
                {theme === id ? t("layoutSelected") : t("layoutTapToUse")}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="eyebrow block mb-2">{t("headline")}</span>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-transparent border-b border-rule py-2 font-display text-xl sm:text-2xl focus:border-oxblood focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="eyebrow block mb-2">{t("subline")}</span>
          <input
            value={subline}
            onChange={(e) => setSubline(e.target.value)}
            className="w-full bg-transparent border-b border-rule py-2 font-display text-base sm:text-lg focus:border-oxblood focus:outline-none"
          />
        </label>

        <p className="text-xs text-ink-faint max-w-2xl leading-relaxed">
          {t("logoHelp")}
        </p>
      </div>

      <div>
        <p className="eyebrow text-oxblood mb-2">{t("livePreviewLabel")}</p>
        <p className="text-sm text-ink-soft mb-3 max-w-2xl">{t("livePreviewHelp")}</p>
        <div
          className="border-2 border-rule rounded-sm overflow-y-auto max-h-[min(78vh,44rem)] bg-paper/15 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] isolate [contain:inline-size]"
        >
          <BillboardFrame
            theme={theme}
            displayName={displayName}
            handle={handle}
            heroTitle={headline}
            heroSub={subline}
            campaigns={previewCampaigns}
            avatarUrl={avatarUrl}
            compact={false}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-oxblood"
        />
        <span className="font-display italic">{t("publishToggle")}</span>
      </label>

      {err && (
        <p className="text-sm text-oxblood font-mono" role="alert">
          {err}
        </p>
      )}
      {ok && (
        <p className="text-sm text-absinthe font-mono">{t("saved")}</p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="inline-flex items-center gap-2 bg-oxblood text-paper px-5 py-2.5 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-oxblood-deep transition-colors disabled:opacity-60"
      >
        {pending ? t("saving") : t("save")}
      </button>
    </div>
  );
}
