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
const THEME_UNDO_MS = 10_000;

function StepPills({ t }: { t: (k: string) => string }) {
  return (
    <div
      className="flex flex-wrap gap-1.5 sm:gap-2"
      aria-label={t("stepGuide")}
    >
      {(["step1", "step2", "step3", "step4"] as const).map((k) => (
        <span
          key={k}
          className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] uppercase border border-rule/50 bg-paper/25 px-2 py-1 text-ink-faint"
        >
          {t(k)}
        </span>
      ))}
    </div>
  );
}

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
      <div className="relative w-full sm:max-w-4xl max-h-[min(90vh,760px)] overflow-y-auto rounded-t-2xl sm:rounded border border-rule bg-paper/95 shadow-2xl text-ink z-[201] sm:my-4">
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
        <p className="px-4 pt-1 text-xs text-ink-faint">{t("themeModalLayoutCompare")}</p>
        <div className="p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["retrowave", "minimal"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onPick(id as BillboardTheme)}
                className={`text-left rounded-lg border-2 transition-colors overflow-hidden bg-paper/40 ${
                  currentTheme === id
                    ? "border-oxblood ring-2 ring-oxblood/15"
                    : "border-rule/50 hover:border-rule"
                }`}
              >
                <p className="px-2 pt-2 font-mono text-[9px] uppercase tracking-widest text-ink-dim">
                  {t(`themeName_${id}` as "themeName_retrowave")}
                </p>
                <p className="px-2 pb-1 text-xs text-ink-faint line-clamp-2 min-h-8">
                  {t(`themeBlurb_${id}` as "themeBlurb_retrowave")}
                </p>
                <div className="border-t border-rule/30">
                  <BillboardThemeMini
                    theme={id as BillboardTheme}
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
          <div>
            <button
              type="button"
              onClick={() => onPick("broadsheet")}
              className={`w-full text-left rounded-lg border-2 transition-colors overflow-hidden bg-paper/40 ${
                currentTheme === "broadsheet"
                  ? "border-oxblood ring-2 ring-oxblood/15"
                  : "border-rule/50 hover:border-rule"
              }`}
            >
              <p className="px-2 pt-2 font-mono text-[9px] uppercase tracking-widest text-ink-dim">
                {t("themeName_broadsheet")}
              </p>
              <p className="px-2 pb-1 text-xs text-ink-faint line-clamp-2 max-w-3xl">
                {t("themeBlurb_broadsheet")}
              </p>
              <div className="border-t border-rule/30 max-w-2xl mx-auto">
                <BillboardThemeMini
                  theme="broadsheet"
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
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type SavedSnap = {
  headline: string;
  subline: string;
  published: boolean;
  theme: BillboardTheme;
};

function StickyActionBar({
  t,
  isDirty,
  pending,
  publicUrl,
  onSave,
}: {
  t: (k: string) => string;
  isDirty: boolean;
  pending: boolean;
  publicUrl: string;
  onSave: () => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-rule bg-paper/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
        pl-4 pr-4 sm:pl-6 sm:pr-6 py-3 md:left-60"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 sm:gap-3">
        {isDirty && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-oxblood/90">
            {t("dirtyBadge")}
          </span>
        )}
        <div className="flex-1 min-w-[2rem]" />
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[9px] sm:text-[10px] tracking-wide uppercase text-ink-dim border border-rule/60 px-3 py-2 hover:border-oxblood/30 hover:text-oxblood transition-colors"
        >
          {t("stickyViewPublic")}
        </a>
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase bg-oxblood text-paper px-4 sm:px-5 py-2.5 hover:bg-oxblood-deep transition-colors disabled:opacity-50"
        >
          {pending ? t("saving") : t("stickySave")}
        </button>
      </div>
    </div>
  );
}

function PreviewPanel({
  refEl,
  t,
  theme,
  displayName,
  handle,
  headline,
  subline,
  previewCampaigns,
  avatarUrl,
  previewFrame,
  setPreviewFrame,
  compactHeight,
  className,
}: {
  refEl: React.RefObject<HTMLDivElement | null>;
  t: (k: string) => string;
  theme: BillboardTheme;
  displayName: string;
  handle: string;
  headline: string;
  subline: string;
  previewCampaigns: BillboardCampaignView[];
  avatarUrl: string | null;
  previewFrame: "desktop" | "mobile";
  setPreviewFrame: (v: "desktop" | "mobile") => void;
  compactHeight: boolean;
  className?: string;
}) {
  const previewShellClass =
    previewFrame === "mobile"
      ? "max-w-[min(100%,400px)] mx-auto border-x border-dashed border-rule/40 shadow-inner"
      : "w-full";

  return (
    <div ref={refEl} className={className}>
      <p className="eyebrow text-oxblood">{t("livePreviewLabel")}</p>
      <p
        className={
          compactHeight ? "text-xs text-ink-soft" : "text-sm text-ink-soft"
        }
      >
        {t("livePreviewHelp")}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        <button
          type="button"
          onClick={() => setPreviewFrame("desktop")}
          className={`font-mono text-[8px] px-2 py-1 border ${
            previewFrame === "desktop"
              ? "border-oxblood text-oxblood"
              : "border-rule/40 text-ink-faint"
          }`}
        >
          {t("previewWidthDesktop")}
        </button>
        <button
          type="button"
          onClick={() => setPreviewFrame("mobile")}
          className={`font-mono text-[8px] px-2 py-1 border ${
            previewFrame === "mobile"
              ? "border-oxblood text-oxblood"
              : "border-rule/40 text-ink-faint"
          }`}
        >
          {t("previewWidthMobile")}
        </button>
      </div>
      <div
        className={`${previewShellClass} border-2 border-rule rounded-sm overflow-y-auto bg-paper/15 [contain:layout] mt-2 ${
          compactHeight
            ? "max-h-[min(55vh,28rem)]"
            : "max-h-[min(85vh,46rem)] shadow-lg"
        }`}
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
  const tPublic = useTranslations("PublicBillboard");
  const locale = useLocale() as "en" | "es";
  const tFn = t as (k: string) => string;
  const tPublicFn = tPublic as (k: string) => string;

  const [headline, setHeadline] = useState(initialHeadline);
  const [subline, setSubline] = useState(initialSubline);
  const [published, setPublished] = useState(initialPublished);
  const [theme, setTheme] = useState<BillboardTheme>(initialTheme);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [previewFrame, setPreviewFrame] = useState<"desktop" | "mobile">("desktop");
  const [revertThemeId, setRevertThemeId] = useState<BillboardTheme | null>(null);
  const themeUndoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lastSaved, setLastSaved] = useState<SavedSnap>(() => ({
    headline: initialHeadline,
    subline: initialSubline,
    published: initialPublished,
    theme: initialTheme,
  }));

  const previewRefMobile = useRef<HTMLDivElement>(null);
  const previewRefDesktop = useRef<HTMLDivElement>(null);

  const isDirty = useMemo(
    () =>
      headline !== lastSaved.headline ||
      subline !== lastSaved.subline ||
      published !== lastSaved.published ||
      theme !== lastSaved.theme,
    [headline, subline, published, theme, lastSaved],
  );

  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

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

  const clearUndoTimer = useCallback(() => {
    if (themeUndoTimer.current) {
      clearTimeout(themeUndoTimer.current);
      themeUndoTimer.current = null;
    }
  }, []);

  const scrollToPreview = useCallback(() => {
    setTimeout(() => {
      const w = window.innerWidth;
      const el = w >= 1024 ? previewRefDesktop.current : previewRefMobile.current;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const commitTheme = useCallback(
    (id: BillboardTheme, fromModal: boolean) => {
      if (id === theme) {
        if (fromModal) setThemeModalOpen(false);
        scrollToPreview();
        return;
      }
      setRevertThemeId(theme);
      setTheme(id);
      clearUndoTimer();
      themeUndoTimer.current = setTimeout(() => {
        setRevertThemeId(null);
        themeUndoTimer.current = null;
      }, THEME_UNDO_MS);
      if (fromModal) setThemeModalOpen(false);
      scrollToPreview();
    },
    [clearUndoTimer, scrollToPreview, theme],
  );

  const onUndoTheme = useCallback(() => {
    if (revertThemeId == null) return;
    setTheme(revertThemeId);
    setRevertThemeId(null);
    clearUndoTimer();
  }, [clearUndoTimer, revertThemeId]);

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
      setLastSaved({
        headline,
        subline,
        published,
        theme,
      });
      setOk(true);
    });
  }, [headline, locale, published, subline, t, theme]);

  return (
    <div className="w-full max-w-7xl space-y-6 sm:space-y-8 text-ink pb-28 text-left">
      <div className="space-y-3">
        <StepPills t={tFn} />
        <p className="text-sm text-ink-faint max-w-2xl">{t("uxIntro")}</p>
      </div>

      <div className="border border-rule bg-paper-warm/20 p-4 sm:p-5" id="bb-step-url">
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

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div className="space-y-6 sm:space-y-8 min-w-0">
          <div className="space-y-4" id="bb-step-content">
            <p className="eyebrow text-ink-faint">{t("sectionContent")}</p>
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

          <div id="bb-step-look" className="space-y-3">
            <p className="eyebrow text-ink-faint">{t("sectionLook")}</p>
            {revertThemeId != null && (
              <div className="flex flex-wrap items-center gap-2 text-sm border border-rule/50 bg-oxblood/[0.06] px-3 py-2">
                <span className="text-ink-soft">{t("themeUndo")}</span>
                <button
                  type="button"
                  onClick={onUndoTheme}
                  className="font-mono text-[9px] uppercase tracking-widest text-oxblood border border-oxblood/40 px-2 py-1 hover:bg-oxblood/10"
                >
                  {t("themeUndoAction")}
                </button>
                <span className="text-xs text-ink-faint">{t("themeUndoDismiss")}</span>
              </div>
            )}
            <p className="text-sm text-ink-soft max-w-2xl">{t("chipsHelp")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {THEMES.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => commitTheme(id, false)}
                  className={`text-left rounded-lg border-2 overflow-hidden transition-colors ${
                    theme === id
                      ? "border-oxblood ring-1 ring-oxblood/20"
                      : "border-rule/50 hover:border-rule"
                  } bg-paper/30`}
                >
                  <p className="px-1.5 pt-1.5 font-mono text-[8px] uppercase tracking-widest text-ink-dim">
                    {t(`themeName_${id}` as "themeName_retrowave")}
                  </p>
                  <div className="border-t border-rule/20">
                    <BillboardThemeMini
                      theme={id}
                      displayName={displayName}
                      handle={handle}
                      heroTitle={headline}
                      heroSub={subline}
                      avatarUrl={avatarUrl}
                      sampleBountyLine={t("miniSampleOffer")}
                      ctaLabel={tPublicFn("cta")}
                    />
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setThemeModalOpen(true)}
              className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-dim border-b border-oxblood/30 pb-0.5 hover:text-oxblood"
            >
              {t("openLayoutDialog")} — {t("compareLarge")}
            </button>
          </div>

          <PreviewPanel
            refEl={previewRefMobile}
            className="space-y-3 border border-rule/30 rounded-sm p-3 bg-paper/10 lg:hidden"
            t={tFn}
            theme={theme}
            displayName={displayName}
            handle={handle}
            headline={headline}
            subline={subline}
            previewCampaigns={previewCampaigns}
            avatarUrl={avatarUrl}
            previewFrame={previewFrame}
            setPreviewFrame={setPreviewFrame}
            compactHeight
          />

          <div className="space-y-2" id="bb-step-publish">
            <p className="eyebrow text-ink-faint">{t("sectionPublish")}</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 accent-oxblood"
              />
              <span className="font-display italic">{t("publishToggle")}</span>
            </label>
          </div>

          {err && (
            <p className="text-sm text-oxblood font-mono" role="alert">
              {err}
            </p>
          )}
          {ok && (
            <p className="text-sm text-absinthe font-mono">{t("saved")}</p>
          )}
        </div>

        <PreviewPanel
          refEl={previewRefDesktop}
          className="hidden lg:block space-y-3 sticky top-6 scroll-mt-20 min-w-0 self-start"
          t={tFn}
          theme={theme}
          displayName={displayName}
          handle={handle}
          headline={headline}
          subline={subline}
          previewCampaigns={previewCampaigns}
          avatarUrl={avatarUrl}
          previewFrame={previewFrame}
          setPreviewFrame={setPreviewFrame}
          compactHeight={false}
        />
      </div>

      <ThemeModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        onPick={(id) => commitTheme(id, true)}
        displayName={displayName}
        handle={handle}
        headline={headline}
        subline={subline}
        avatarUrl={avatarUrl}
        currentTheme={theme}
      />

      <StickyActionBar
        t={tFn}
        isDirty={isDirty}
        pending={pending}
        publicUrl={publicUrl}
        onSave={onSave}
      />
    </div>
  );
}
