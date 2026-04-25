"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { requestPayout } from "@/lib/ledger/payout-actions";

export function SettlementRequestForm({
  availableCents,
  currency,
}: {
  availableCents: number;
  currency: string;
}) {
  const t = useTranslations("Ledger");
  const [rail, setRail] = useState<"usdc" | "sepa">("usdc");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  const disabled = availableCents <= 0 || pending;

  function submit() {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await requestPayout({
        amountCents: availableCents,
        currency,
        rail,
        destination,
      });
      if (!res.ok) {
        if (res.error === "insufficient_available") setError(t("settlementErrInsufficient"));
        else if (res.error === "invalid_input") setError(t("settlementErrInvalid"));
        else if (res.error === "unauthorized") setError(t("settlementErrUnauthorized"));
        else setError(res.error);
        return;
      }
      setOk(true);
      setDestination("");
    });
  }

  return (
    <div className="border border-rule p-4 sm:p-6 bg-paper-warm/20">
      <p className="eyebrow text-ink-faint mb-2">{t("settlementRequestK")}</p>
      <p className="text-sm text-ink-soft mb-5">{t("settlementRequestBody")}</p>

      <label className="block mb-4">
        <span className="eyebrow block mb-2">{t("settlementRailLabel")}</span>
        <select
          value={rail}
          onChange={(e) => setRail(e.target.value as "usdc" | "sepa")}
          className="w-full bg-transparent border border-rule py-2 px-2 font-display text-base focus:border-oxblood focus:outline-none"
          disabled={pending}
        >
          <option value="usdc">{t("settlementRailUsdc")}</option>
          <option value="sepa">{t("settlementRailSepa")}</option>
        </select>
      </label>

      <label className="block mb-4">
        <span className="eyebrow block mb-2">{t("settlementDestinationLabel")}</span>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t("settlementDestinationPlaceholder")}
          className="w-full bg-transparent border-b border-rule py-2 px-1 font-display text-lg focus:border-oxblood focus:outline-none placeholder:text-ink-faint/50"
          disabled={pending}
        />
      </label>

      {error && <p className="text-sm text-oxblood font-mono mb-3">{error}</p>}
      {ok && <p className="text-sm text-absinthe font-mono mb-3">{t("settlementOk")}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        className="inline-flex items-center gap-2 bg-oxblood text-paper px-5 py-2.5 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-oxblood-deep transition-colors disabled:opacity-50"
      >
        {pending ? t("settlementRequesting") : t("settlementRequestCta")}
      </button>
    </div>
  );
}

