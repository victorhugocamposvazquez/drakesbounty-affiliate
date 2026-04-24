"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StepIndicator } from "./step-indicator";
import { WaxSeal } from "./wax-seal";
import { completeOath, type CompleteOathInput } from "@/lib/auth/actions";

type Role = "creator" | "operator";

type FormState = {
  handle: string;
  displayName: string;
  legalName: string;
  country: string;
  vertical: string;
  channel: string;
  audience: string;
  markets: string;
  website: string;
  accepted: boolean;
};

const INITIAL: FormState = {
  handle: "",
  displayName: "",
  legalName: "",
  country: "",
  vertical: "",
  channel: "",
  audience: "",
  markets: "",
  website: "",
  accepted: false,
};

const VERTICAL_KEYS = [
  "casino",
  "sports",
  "trading",
  "crypto",
  "poker",
  "other",
] as const;
const CHANNEL_KEYS = [
  "twitch",
  "kick",
  "telegram",
  "x",
  "youtube",
  "instagram",
  "discord",
  "other",
] as const;

export function OathForm({
  role,
  articles,
  userEmail,
  initialHandle,
}: {
  role: Role;
  /** The 5 articles of the oath, already localized server-side. */
  articles: Array<{ title: string; body: string }>;
  /** Email of the authenticated user (read-only in the form). */
  userEmail: string;
  /** Optional handle suggestion (from profile or OAuth provider). */
  initialHandle?: string;
}) {
  const t = useTranslations("Oath");
  const locale = useLocale() as "en" | "es";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>({
    ...INITIAL,
    handle: initialHandle ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string>("");
  const [pending, startTransition] = useTransition();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(target: 1 | 2 | 3): boolean {
    const next: typeof errors = {};
    if (target >= 1) {
      if (role === "creator") {
        if (!form.handle) next.handle = t("errorRequired");
        else if (!/^[a-zA-Z0-9_-]{2,32}$/.test(form.handle))
          next.handle = t("errorHandle");
      }
      if (role === "operator" && !form.legalName)
        next.legalName = t("errorRequired");
      if (!form.country) next.country = t("errorRequired");
    }
    if (target >= 2) {
      if (!form.vertical) next.vertical = t("errorRequired");
      if (role === "creator" && !form.channel)
        next.channel = t("errorRequired");
    }
    if (target >= 3) {
      if (!form.accepted) next.accepted = t("errorMustAccept");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();
    if (step < 3 && validateStep(step as 1 | 2)) {
      setStep(((step as 1 | 2) + 1) as 2 | 3);
    }
  }

  function handleSeal(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(3)) return;
    setSubmitError(null);

    const articlesAccepted = articles.map((_, i) => `${role}-${i + 1}`);

    const payload: CompleteOathInput =
      role === "creator"
        ? {
            role: "creator",
            locale,
            handle: form.handle,
            displayName: form.displayName || "",
            country: form.country,
            vertical: form.vertical as CompleteOathInput["vertical"],
            channel: form.channel as Extract<
              CompleteOathInput,
              { role: "creator" }
            >["channel"],
            audience: form.audience ? Number(form.audience) : undefined,
            website: form.website || "",
            articlesAccepted,
          }
        : {
            role: "operator",
            locale,
            legalName: form.legalName,
            country: form.country,
            vertical: form.vertical as CompleteOathInput["vertical"],
            markets: form.markets,
            website: form.website || "",
            articlesAccepted,
          };

    startTransition(async () => {
      const result = await completeOath(payload);
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      setMemberId(result.memberId);
      setStep(4);
    });
  }

  if (step === 4) {
    return (
      <SealedScreen
        role={role}
        memberId={memberId}
        locale={locale}
        t={t}
        ledgerHref={`/${locale}/ledger`}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Link
          href="/"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-ink transition-colors"
        >
          ← {t("backStep")}
        </Link>
        <StepIndicator current={step} total={3} label={t("stepLabel")} />
      </div>

      {/* Title */}
      <p className="eyebrow mb-3">
        {role === "creator" ? t("creatorOverline") : t("operatorOverline")}
      </p>
      <h1
        className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {step === 1 && t("step1Title")}
        {step === 2 && t("step2Title")}
        {step === 3 && t("step3Title")}
      </h1>
      <p className="font-display italic text-lg text-ink-soft mb-12">
        {step === 1 && t("step1Subtitle")}
        {step === 2 && t("step2Subtitle")}
        {step === 3 && t("step3Subtitle")}
      </p>

      <form
        onSubmit={step === 3 ? handleSeal : handleNext}
        className="space-y-8"
        noValidate
      >
        {step === 1 && (
          <>
            {/* Email is read-only: already authenticated */}
            <Field
              label={t("fieldEmail")}
              help={t("fieldEmailLocked")}
              input={
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  disabled
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                />
              }
            />
            {role === "creator" ? (
              <>
                <Field
                  label={t("fieldHandle")}
                  error={errors.handle}
                  input={
                    <input
                      type="text"
                      value={form.handle}
                      onChange={(e) =>
                        update(
                          "handle",
                          e.target.value
                            .replace(/\s/g, "")
                            .replace(/[^a-zA-Z0-9_-]/g, ""),
                        )
                      }
                      placeholder={t("fieldHandlePlaceholder")}
                      className={inputClass}
                      maxLength={32}
                      autoFocus
                      required
                    />
                  }
                />
                <Field
                  label={t("fieldDisplayName")}
                  input={
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => update("displayName", e.target.value)}
                      placeholder={t("fieldDisplayNamePlaceholder")}
                      className={inputClass}
                    />
                  }
                />
              </>
            ) : (
              <Field
                label={t("fieldLegalName")}
                error={errors.legalName}
                input={
                  <input
                    type="text"
                    value={form.legalName}
                    onChange={(e) => update("legalName", e.target.value)}
                    placeholder={t("fieldLegalNamePlaceholder")}
                    className={inputClass}
                    autoFocus
                    required
                  />
                }
              />
            )}
            <Field
              label={t("fieldCountry")}
              error={errors.country}
              input={
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    update(
                      "country",
                      e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2),
                    )
                  }
                  placeholder={t("fieldCountryPlaceholder")}
                  maxLength={2}
                  className={inputClass}
                  required
                />
              }
            />
          </>
        )}

        {step === 2 && (
          <>
            <Field
              label={t("fieldVertical")}
              error={errors.vertical}
              input={
                <ChipGroup
                  value={form.vertical}
                  onChange={(v) => update("vertical", v)}
                  options={VERTICAL_KEYS.map((k) => ({
                    value: k,
                    label: t(`verticals.${k}`),
                  }))}
                />
              }
            />

            {role === "creator" ? (
              <>
                <Field
                  label={t("fieldChannel")}
                  error={errors.channel}
                  input={
                    <ChipGroup
                      value={form.channel}
                      onChange={(v) => update("channel", v)}
                      options={CHANNEL_KEYS.map((k) => ({
                        value: k,
                        label: t(`channels.${k}`),
                      }))}
                    />
                  }
                />
                <Field
                  label={t("fieldAudience")}
                  help={t("fieldAudienceHelp")}
                  input={
                    <input
                      type="number"
                      min={0}
                      value={form.audience}
                      onChange={(e) => update("audience", e.target.value)}
                      placeholder={t("fieldAudiencePlaceholder")}
                      className={inputClass}
                    />
                  }
                />
              </>
            ) : (
              <>
                <Field
                  label={t("fieldMarkets")}
                  help={t("fieldMarketsHelp")}
                  input={
                    <input
                      type="text"
                      value={form.markets}
                      onChange={(e) =>
                        update("markets", e.target.value.toUpperCase())
                      }
                      placeholder={t("fieldMarketsPlaceholder")}
                      className={inputClass}
                    />
                  }
                />
                <Field
                  label={t("fieldWebsite")}
                  input={
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      placeholder={t("fieldWebsitePlaceholder")}
                      className={inputClass}
                    />
                  }
                />
              </>
            )}
          </>
        )}

        {step === 3 && (
          <ArticlesReview
            articles={articles}
            accepted={form.accepted}
            onAccept={(v) => update("accepted", v)}
            error={errors.accepted}
            t={t}
          />
        )}

        {submitError && (
          <div
            role="alert"
            className="border-l-2 border-oxblood pl-4 py-2 text-sm text-oxblood font-mono tracking-wide"
          >
            {humanizeCompleteError(submitError, t)}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-rule">
          {step > 1 ? (
            <button
              type="button"
              onClick={() =>
                setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)
              }
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-faint hover:text-ink transition-colors"
            >
              ← {t("backStep")}
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-3 bg-oxblood text-paper px-6 py-3 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-oxblood-deep transition-colors disabled:opacity-60"
          >
            {pending
              ? t("signing")
              : step === 3
                ? t("signButton")
                : t("nextStep")}
            {!pending && <span aria-hidden>→</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============ Subcomponents ============ */

const inputClass =
  "w-full bg-transparent border-b border-rule py-2 px-1 font-display text-xl focus:border-oxblood focus:outline-none placeholder:text-ink-faint/50 transition-colors";

function Field({
  label,
  input,
  help,
  error,
}: {
  label: string;
  input: React.ReactNode;
  help?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {input}
      {help && !error && (
        <span className="mt-1 block text-xs text-ink-faint">{help}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-oxblood font-mono tracking-wider">
          {error}
        </span>
      )}
    </label>
  );
}

function ChipGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 border font-display text-sm transition-all ${
              selected
                ? "border-oxblood bg-oxblood text-paper"
                : "border-rule text-ink-dim hover:border-ink/60"
            }`}
            aria-pressed={selected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ArticlesReview({
  articles,
  accepted,
  onAccept,
  error,
  t,
}: {
  articles: Array<{ title: string; body: string }>;
  accepted: boolean;
  onAccept: (v: boolean) => void;
  error?: string;
  t: (key: string) => string;
}) {
  const ROMAN = ["I", "II", "III", "IV", "V"];
  return (
    <div>
      <p className="text-ink-dim mb-6">{t("codeIntro")}</p>
      <ol className="space-y-5 mb-8">
        {articles.map((a, i) => (
          <li
            key={i}
            className="flex gap-4 border-l border-rule pl-5 hover:border-oxblood transition-colors"
          >
            <span
              className="roman text-lg leading-none w-6 flex-none -ml-9 text-right"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {ROMAN[i]}.
            </span>
            <div>
              <h3 className="font-display font-medium text-lg mb-1">
                {a.title}
              </h3>
              <p className="text-ink-soft text-[14px] leading-relaxed">
                {a.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <label className="flex items-start gap-3 cursor-pointer p-4 border border-rule hover:border-oxblood transition-colors group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAccept(e.target.checked)}
          className="mt-1 accent-oxblood h-4 w-4"
        />
        <span className="font-display italic text-lg group-hover:text-oxblood transition-colors">
          {t("signCheckbox")}
        </span>
      </label>
      {error && (
        <p className="mt-2 text-xs text-oxblood font-mono tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}

function SealedScreen({
  role,
  memberId,
  t,
  locale,
  ledgerHref,
}: {
  role: Role;
  memberId: string;
  t: (key: string) => string;
  locale: string;
  ledgerHref: string;
}) {
  const today = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
      <div className="flex justify-center mb-10">
        <WaxSeal
          size={220}
          initial="D"
          sealed
          text={`DRAKE'S BOUNTY · ${role.toUpperCase()} · MMXXVI · `}
        />
      </div>
      <p className="eyebrow mb-3">{t("sealedTitle")}</p>
      <h1
        className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {role === "creator" ? t("creatorOathTitle") : t("operatorOathTitle")}
      </h1>
      <p className="font-display italic text-lg text-ink-soft max-w-md mx-auto mb-12">
        {t("sealedSubtitle")}
      </p>

      <dl className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-12 text-left border-y border-rule py-6">
        <div>
          <dt className="eyebrow mb-1">{t("sealedId")}</dt>
          <dd className="font-mono text-sm">{memberId}</dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">{t("sealedDate")}</dt>
          <dd className="font-mono text-sm">{today}</dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">{t("sealedRank")}</dt>
          <dd className="font-display italic text-sm">{t("rankDeputy")}</dd>
        </div>
      </dl>

      <p className="font-display italic text-xl text-ink-dim mb-10">
        {t("sealedQuote")}
      </p>

      <a
        href={ledgerHref}
        className="inline-flex items-center gap-3 bg-oxblood text-paper px-6 py-3 font-mono text-[10px] tracking-[0.28em] uppercase hover:bg-oxblood-deep transition-colors"
      >
        {t("sealedCta")} →
      </a>
    </div>
  );
}

function humanizeCompleteError(
  error: string,
  t: (key: string) => string,
): string {
  if (error === "handle_taken") return t("errorHandleTaken");
  if (error === "not_authenticated") return t("errorNotAuthenticated");
  if (error === "invalid_input") return t("errorInvalidInput");
  return error;
}
