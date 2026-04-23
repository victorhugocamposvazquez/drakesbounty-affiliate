import { getTranslations, setRequestLocale } from "next-intl/server";
import { LedgerPlaceholder } from "@/components/ledger/ledger-placeholder";

export default async function MapRoomPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Ledger");
  return (
    <LedgerPlaceholder
      overline={t("sectionStubOverline")}
      title={t("stubs.mapRoomTitle")}
      body={t("stubs.mapRoomBody")}
    />
  );
}
