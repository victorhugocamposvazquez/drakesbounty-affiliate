import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/service";
import { BillboardFrame } from "@/components/billboard/billboard-frame";
import { normalizeBillboardTheme } from "@/lib/billboard-theme";

type CampaignRow = {
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
    vertical: string | null;
    payout_model: string;
    cpa_amount_cents: number | null;
    revshare_pct: string | null;
    currency: string;
  } | null;
};

export const dynamic = "force-dynamic";

export default async function PublicBillboardPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PublicBillboard");

  if (!handle) notFound();

  let sb: ReturnType<typeof createServiceClient>;
  try {
    sb = createServiceClient();
  } catch {
    return (
      <p className="p-8 text-center text-amber-200/90 font-mono text-sm max-w-md mx-auto">
        {t("configError")}
      </p>
    );
  }

  const { data: profile, error: pe } = await sb
    .from("profiles")
    .select("id, display_name, handle, role, avatar_url")
    .ilike("handle", handle)
    .maybeSingle();

  if (pe || !profile) notFound();
  if (profile.role !== "creator") notFound();

  const { data: cr, error: ce } = await sb
    .from("creators")
    .select("billboard_headline, billboard_subline, billboard_published, tier, vertical, billboard_theme")
    .eq("id", profile.id)
    .maybeSingle();

  if (ce || !cr) notFound();
  if (!cr.billboard_published) {
    return (
      <div className="px-5 py-20 text-center max-w-md mx-auto">
        <p className="[font-family:var(--font-crt)] text-2xl text-[#00ffff] mb-4">
          {t("unpublishedTitle")}
        </p>
        <p className="text-[#b8a5d6] text-sm">{t("unpublishedBody")}</p>
      </div>
    );
  }

  const { data: rawRows, error: re } = await sb
    .from("billboard_campaigns")
    .select(
      `
      id, position, featured, custom_title, custom_message, visible,
      bounties (
        id, title, description, status, vertical, payout_model,
        cpa_amount_cents, revshare_pct, currency
      )
    `,
    )
    .eq("creator_id", profile.id)
    .eq("visible", true)
    .order("position", { ascending: true });

  if (re) {
    return (
      <p className="p-8 text-center text-red-300 font-mono text-sm">
        {t("loadError")}
      </p>
    );
  }

  const campaigns = (rawRows ?? []) as unknown as CampaignRow[];

  return (
    <BillboardFrame
      theme={normalizeBillboardTheme(cr.billboard_theme)}
      displayName={profile.display_name || profile.handle || handle}
      handle={profile.handle!}
      heroTitle={cr.billboard_headline}
      heroSub={cr.billboard_subline}
      campaigns={campaigns}
      avatarUrl={profile.avatar_url}
    />
  );
}
