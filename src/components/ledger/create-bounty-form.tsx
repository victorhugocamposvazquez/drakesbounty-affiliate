"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createBounty, type CreateBountyResult } from "@/lib/ledger/bounty-actions";

export function CreateBountyForm({ locale }: { locale: string }) {
  const t = useTranslations("Ledger");
  const tOath = useTranslations("Oath");
  const [state, action, pending] = useActionState(
    createBounty,
    undefined as CreateBountyResult | undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const errMsg = (() => {
    if (!state || state.ok) return null;
    const e = state.error;
    if (e === "unauthorized") return t("createBountyErrUnauthorized");
    if (e === "forbidden") return t("createBountyErrForbidden");
    if (e === "no_operator_row") return t("createBountyErrNoOperator");
    if (e === "invalid_tracking_url") return t("createBountyErrInvalidUrl");
    return t("createBountyErrValidation");
  })();

  return (
    <div className="mb-10 border border-rule bg-paper-warm/15 p-4 sm:p-6">
      <p className="eyebrow text-oxblood mb-2">{t("createBountyK")}</p>
      <p className="text-sm text-ink-soft mb-5 max-w-xl">{t("createBountyIntro")}</p>
      <form ref={formRef} action={action} className="max-w-2xl space-y-4">
        <input type="hidden" name="locale" value={locale} />
        {state?.ok && (
          <p className="text-sm text-oxblood font-display">{t("createBountyOk")}</p>
        )}
        {errMsg && <p className="text-sm text-oxblood">{errMsg}</p>}
        <div>
          <label className="eyebrow text-ink-faint block mb-1">{t("createBountyTitle")}</label>
          <input
            name="title"
            required
            maxLength={200}
            className="w-full bg-transparent border-b border-rule py-2 font-display text-lg focus:border-oxblood focus:outline-none"
          />
        </div>
        <div>
          <label className="eyebrow text-ink-faint block mb-1">
            {t("createBountyDescription")}
          </label>
          <textarea
            name="description"
            rows={3}
            maxLength={2000}
            className="w-full bg-transparent border border-rule p-2 text-sm text-ink-soft focus:border-oxblood focus:outline-none resize-y min-h-[4rem]"
          />
        </div>
        <div>
          <label className="eyebrow text-ink-faint block mb-1">
            {t("createBountyTrackingUrl")}
          </label>
          <input
            name="tracking_url"
            type="url"
            inputMode="url"
            maxLength={2048}
            placeholder="https://"
            className="w-full bg-transparent border-b border-rule py-2 font-mono text-sm"
          />
          <p className="text-xs text-ink-faint mt-1.5 max-w-xl">{t("createBountyTrackingUrlHelp")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-ink-faint block mb-1">
              {t("createBountyVertical")}
            </label>
            <select
              name="vertical"
              required
              className="w-full bg-paper border border-rule py-2 px-1 font-mono text-sm"
              defaultValue="casino"
            >
              {(
                [
                  "casino",
                  "sports",
                  "trading",
                  "crypto",
                  "poker",
                  "other",
                ] as const
              ).map((v) => (
                <option key={v} value={v}>
                  {tOath(`verticals.${v}` as "verticals.casino")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-ink-faint block mb-1">
              {t("createBountyModel")}
            </label>
            <select
              name="payout_model"
              required
              className="w-full bg-paper border border-rule py-2 px-1 font-mono text-sm"
              defaultValue="cpa"
            >
              <option value="cpa">CPA</option>
              <option value="revshare">Rev share</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-ink-faint block mb-1">
              {t("createBountyCpaCents")}
            </label>
            <input
              name="cpa_amount_cents"
              type="number"
              min={0}
              step={1}
              className="w-full bg-transparent border-b border-rule py-2 font-mono text-sm"
              placeholder="e.g. 5000"
            />
          </div>
          <div>
            <label className="eyebrow text-ink-faint block mb-1">
              {t("createBountyRevshare")}
            </label>
            <input
              name="revshare_pct"
              type="number"
              min={0}
              max={100}
              step={0.01}
              className="w-full bg-transparent border-b border-rule py-2 font-mono text-sm"
              placeholder="e.g. 35"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-ink-faint block mb-1">
              {t("createBountyCurrency")}
            </label>
            <select
              name="currency"
              className="w-full bg-paper border border-rule py-2 px-1 font-mono text-sm"
              defaultValue="EUR"
            >
              {["EUR", "USD", "GBP", "USDC"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-ink-faint block mb-1">
              {t("createBountyStatus")}
            </label>
            <select
              name="status"
              className="w-full bg-paper border border-rule py-2 px-1 font-mono text-sm"
              defaultValue="draft"
            >
              <option value="draft">{t("bountyStatus.draft")}</option>
              <option value="active">{t("bountyStatus.active")}</option>
              <option value="paused">{t("bountyStatus.paused")}</option>
              <option value="ended">{t("bountyStatus.ended")}</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="font-mono text-[10px] tracking-[0.28em] uppercase border border-oxblood text-oxblood px-4 py-2.5 hover:bg-oxblood hover:text-paper transition-colors disabled:opacity-50"
        >
          {pending ? t("createBountyWorking") : t("createBountySubmit")}
        </button>
      </form>
    </div>
  );
}
