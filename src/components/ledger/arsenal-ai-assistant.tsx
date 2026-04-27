"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { CopyToClipboardButton } from "@/components/copy-to-clipboard-button";
import {
  generateArsenalCopyAction,
  type ArsenalGenerateState,
} from "@/lib/ledger/arsenal-ai-actions";

const initial: ArsenalGenerateState = null;

export function ArsenalAiAssistant({
  locale,
  configured,
}: {
  locale: "en" | "es";
  /** Server knows if OPENAI / ARSENAL key is set (no secret sent). */
  configured: boolean;
}) {
  const t = useTranslations("Ledger");
  const [state, action, pending] = useActionState(
    generateArsenalCopyAction,
    initial,
  );
  const formId = useId();
  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok && outRef.current) {
      outRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [state]);

  const err: string | null = (() => {
    if (!configured || state === null || state.ok) return null;
    if (state.code === "rate_limit" && state.max != null) {
      return t("arsenalAiErrRateLimited", {
        used: state.used ?? state.max,
        max: state.max,
        window: state.windowMinutes ?? 60,
      });
    }
    if (state.code === "unauthorized") return t("arsenalAiErrUnauthorized");
    if (state.code === "no_key") return t("arsenalAiErrNoKey");
    if (state.code === "http") return t("arsenalAiErrUpstream");
    if (state.code === "empty") return t("arsenalAiErrEmpty");
    return t("arsenalAiErrParse");
  })();

  return (
    <section
      className="border border-oxblood/30 bg-paper-warm/15 p-5 sm:p-6 mb-10"
      aria-labelledby={`${formId}-h`}
    >
      <p id={`${formId}-h`} className="eyebrow text-oxblood mb-2">
        {t("arsenalAiK")}
      </p>
      <p className="text-sm text-ink-soft mb-5 max-w-2xl leading-relaxed">
        {t("arsenalAiIntro")}
      </p>

      {!configured && (
        <p
          className="text-sm text-ink-dim font-mono mb-4 border border-rule/60 bg-paper/30 px-3 py-2"
          role="status"
        >
          {t("arsenalAiErrNoKey")}
        </p>
      )}

      <form action={action} className="space-y-4 max-w-2xl">
        <input type="hidden" name="locale" value={locale} />
        <div>
          <label
            htmlFor={`${formId}-kind`}
            className="eyebrow text-ink-faint block mb-1.5"
          >
            {t("arsenalAiKindLabel")}
          </label>
          <select
            id={`${formId}-kind`}
            name="kind"
            required
            disabled={!configured}
            className="w-full max-w-md bg-paper border border-rule py-2 px-1 font-mono text-sm"
            defaultValue="panel"
          >
            <option value="panel">{t("arsenalAiKindPanel")}</option>
            <option value="stream">{t("arsenalAiKindStream")}</option>
            <option value="bio">{t("arsenalAiKindBio")}</option>
            <option value="compliance">{t("arsenalAiKindCompliance")}</option>
            <option value="hook">{t("arsenalAiKindHook")}</option>
          </select>
        </div>
        <div>
          <label
            htmlFor={`${formId}-notes`}
            className="eyebrow text-ink-faint block mb-1.5"
          >
            {t("arsenalAiNotesLabel")}
          </label>
          <textarea
            id={`${formId}-notes`}
            name="notes"
            maxLength={800}
            rows={3}
            disabled={!configured}
            placeholder={t("arsenalAiNotesPlaceholder")}
            className="w-full bg-transparent border border-rule p-2 text-sm text-ink-soft focus:border-oxblood focus:outline-none resize-y min-h-[4.5rem]"
          />
        </div>
        {err && configured && (
          <p className="text-sm text-oxblood" role="alert">
            {err}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || !configured}
            className="font-mono text-[10px] tracking-[0.28em] uppercase border border-oxblood text-oxblood px-4 py-2.5 hover:bg-oxblood hover:text-paper transition-colors disabled:opacity-50"
          >
            {pending ? t("arsenalAiWorking") : t("arsenalAiSubmit")}
          </button>
        </div>
      </form>

      {state?.ok && state.variants.length > 0 && (
        <div ref={outRef} className="mt-8 border-t border-rule/50 pt-6">
          <p className="eyebrow text-ink-faint mb-3">{t("arsenalAiResultK")}</p>
          <ul className="space-y-3">
            {state.variants.map((line, i) => (
              <li
                key={i}
                className="border border-rule/80 bg-paper/30 p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
              >
                <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap min-w-0 flex-1">
                  {line}
                </p>
                <CopyToClipboardButton
                  text={line}
                  label={t("arsenalCopyCta")}
                  copiedLabel={t("arsenalCopyCopied")}
                />
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-faint mt-4 leading-relaxed max-w-2xl">
            {t("arsenalAiDisclosure")}
          </p>
        </div>
      )}
    </section>
  );
}
