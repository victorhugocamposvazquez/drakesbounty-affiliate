"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { BillboardFrame } from "@/components/billboard/billboard-frame";
import { BillboardThemeMini } from "@/components/billboard/billboard-theme-mini";
import type { BillboardCampaignView } from "@/components/billboard/billboard-frame";
import type { BillboardTheme } from "@/lib/billboard-theme";
import { BILLBOARD_THEMES } from "@/lib/billboard-theme";
import { saveBillboardSettings } from "@/lib/ledger/billboard-actions";

const THEMES: BillboardTheme[] = [...BILLBOARD_THEMES];

function ThemeModal({
  open,
  onClose,
  onPick,
  displayName,
  handle,
  headline,
  subline,
  avatarUrl,
  currentTheme,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (id: BillboardTheme) => void;
  displayName: string;
  handle: string;
  headline: string;
  subline: string;
  avatarUrl: string | null;
  currentTheme: BillboardTheme;
}) {
  const t = useTranslations("Billboard");
  const tPublic = useTranslations("PublicBillboard");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bb-theme-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/70 backdrop-blur-[2px] cursor-default"
        aria-label={t("themeModalClose")}
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-4xl max-h-[min(90vh,720px)] overflow-y-auto rounded-t-2xl sm:rounded border border-rule bg-paper/95 shadow-2xl text-ink z-[201] sm:my-4">
        <div className="sticky top-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-rule bg-paper-warm/30 backdrop-blur-sm">
          <h2
            id="bb-theme-dialog-title"
            className="font-display text-lg sm:text-xl text-oxblood"
          >
            {t("themeModalTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-faint hover:text-oxblood px-2 py-1"
          >
            {t("themeModalClose")}
          </button>
        </div>
        <p className="px-4 pt-3 text-sm text-ink-soft">{t("themeModalHint")}</p>
        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onPick(id)}
              className={`text-left rounded-lg border-2 transition-colors overflow-hidden bg-paper/40 ${
                currentTheme === id
                  ? "border-oxblood ring-2 ring-oxblood/15"
                  : "border-rule/50 hover:border-rule"
              }`}
            >
              <p className="px-2 pt-2 font-mono text-[9px] uppercase tracking-widest text-ink-dim">
                {t(`themeName_${id}` as "themeName_retrowave")}
              </p>
              <p className="px-2 pb-1 text-xs text-ink-faint line-clamp-2">
                {t(`themeBlurb_${id}` as "themeBlurb_retrowave")}
              </p>
              <div className="border-t border-rule/30">
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
              <p className="px-2 py-1.5 text-center font-mono text-[9px] text-ink-faint">
                {t("themeModalSelect")}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
  const locale = useLocale() as "en" | "es";
  const [headline, setHeadline] = useState(initialHeadline);
  const [subline, setSubline] = useState(initialSubline);
  const [published, setPublished] = useState(initialPublished);
  const [theme, setTheme] = useState<BillboardTheme>(initialTheme);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const livePreviewRef = useRef<HTMLDivElement>(null);

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

  const pickTheme = useCallback(
    (id: BillboardTheme) => {
      setTheme(id);
      setThemeModalOpen(false);
      requestAnimationFrame(() => {
        setTimeout(() => {
          livePreviewRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      });
    },
    [],
  );

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

      <div className="border border-rule bg-paper/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-faint mb-1">{t("layoutRowLabel")}</p>
          <p className="font-display text-lg sm:text-xl text-ink">
            {t(`themeName_${theme}` as "themeName_retrowave")}
          </p>
          <p className="text-xs text-ink-faint mt-1 max-w-md">{t("layoutRowHint")}</p>
        </div>
        <button
          type="button"
          onClick={() => setThemeModalOpen(true)}
          className="shrink-0 self-start sm:self-center font-mono text-[10px] tracking-[0.24em] uppercase border border-oxblood/60 text-oxblood px-4 py-2.5 hover:bg-oxblood/10 transition-colors"
        >
          {t("openLayoutDialog")}
        </button>
      </div>

      <ThemeModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        onPick={pickTheme}
        displayName={displayName}
        handle={handle}
        headline={headline}
        subline={subline}
        avatarUrl={avatarUrl}
        currentTheme={theme}
      />

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

      <div
        ref={livePreviewRef}
        className="scroll-mt-24"
      >
        <p className="eyebrow text-oxblood mb-2">{t("livePreviewLabel")}</p>
        <p className="text-sm text-ink-soft mb-3 max-w-2xl">{t("livePreviewHelp")}</p>
        <div
          className="border-2 border-rule rounded-sm overflow-y-auto max-h-[min(78vh,44rem)] bg-paper/15 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] relative isolate [contain:layout]"
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
            contained
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
