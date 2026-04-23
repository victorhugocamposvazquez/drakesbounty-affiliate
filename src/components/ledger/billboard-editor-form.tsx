"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { saveBillboardSettings } from "@/lib/ledger/billboard-actions";

export function BillboardEditorForm({
  initialHeadline,
  initialSubline,
  initialPublished,
  publicUrl,
  handle,
}: {
  initialHeadline: string;
  initialSubline: string;
  initialPublished: boolean;
  publicUrl: string;
  handle: string;
}) {
  const t = useTranslations("Billboard");
  const locale = useLocale() as "en" | "es";
  const [headline, setHeadline] = useState(initialHeadline);
  const [subline, setSubline] = useState(initialSubline);
  const [published, setPublished] = useState(initialPublished);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  function onSave() {
    setErr(null);
    setOk(false);
    start(async () => {
      const res = await saveBillboardSettings({
        locale,
        headline,
        subline,
        published,
      });
      if (!res.ok) {
        if (res.error === "not_creator") setErr(t("errorNotCreator"));
        else if (res.error === "unauthorized")
          setErr(t("errorUnauthorized"));
        else setErr(res.error);
        return;
      }
      setOk(true);
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="border border-rule bg-paper-warm/20 p-5">
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

      <label className="block">
        <span className="eyebrow block mb-2">{t("headline")}</span>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full bg-transparent border-b border-rule py-2 font-display text-2xl focus:border-oxblood focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="eyebrow block mb-2">{t("subline")}</span>
        <input
          value={subline}
          onChange={(e) => setSubline(e.target.value)}
          className="w-full bg-transparent border-b border-rule py-2 font-display text-lg focus:border-oxblood focus:outline-none"
        />
      </label>

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
