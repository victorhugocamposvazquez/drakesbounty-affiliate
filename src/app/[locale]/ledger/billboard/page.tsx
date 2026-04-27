import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { absoluteUrl } from "@/lib/env";
import { normalizeBillboardTheme } from "@/lib/billboard-theme";
import { BillboardEditorForm } from "@/components/ledger/billboard-editor-form";
import { Link } from "@/i18n/navigation";

export default async function LedgerBillboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Billboard");

  const session = await getCurrentProfile();
  if (!session?.profile) {
    return (
      <div className="max-w-md">
        <p className="eyebrow text-oxblood mb-2">{t("overline")}</p>
        <p className="text-ink-soft font-mono text-sm">
          {t("sessionError")}
        </p>
      </div>
    );
  }

  if (session.profile.role !== "creator" && session.profile.role !== "admin") {
    return (
      <div className="max-w-xl">
        <p className="eyebrow text-oxblood mb-2">{t("operatorGateOverline")}</p>
        <h1
          className="font-display text-3xl sm:text-4xl mb-3"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {t("operatorGateTitle")}
        </h1>
        <p className="text-ink-soft mb-6">{t("operatorGateBody")}</p>
        <Link
          href="/ledger"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-ink-dim"
        >
          ← {t("backToLedger")}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: cr, error } = await supabase
    .from("creators")
    .select(
      "billboard_headline, billboard_subline, billboard_published, billboard_theme",
    )
    .eq("id", session.user.id)
    .single();

  if (error || !cr) {
    return (
      <p className="text-ink-soft">
        {t("loadError")}
      </p>
    );
  }

  if (!session.profile.handle) {
    return (
      <p className="text-ink-soft max-w-md">{t("needHandle")}</p>
    );
  }

  const publicPath = `/${locale}/b/${session.profile.handle}`;
  const publicUrl = absoluteUrl(publicPath);
  const displayName =
    session.profile.display_name || session.profile.handle || "—";

  return (
    <div className="max-w-4xl">
      <p className="eyebrow mb-3 text-oxblood">{t("overline")}</p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {t("title")}
      </h1>
      <p className="font-display italic text-base sm:text-lg text-ink-soft mb-8 sm:mb-10 max-w-2xl">
        {t("subtitle")}
      </p>

      <BillboardEditorForm
        initialHeadline={cr.billboard_headline || ""}
        initialSubline={cr.billboard_subline || ""}
        initialPublished={cr.billboard_published}
        initialTheme={normalizeBillboardTheme(cr.billboard_theme)}
        publicUrl={publicUrl}
        handle={session.profile.handle}
        displayName={displayName}
        avatarUrl={session.profile.avatar_url}
      />
    </div>
  );
}
