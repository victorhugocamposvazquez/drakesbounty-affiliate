import { getTranslations, setRequestLocale } from "next-intl/server";
import { LedgerPlaceholder } from "@/components/ledger/ledger-placeholder";

export default async function SettlementPage({
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
      title={t("stubs.settlementTitle")}
      body={t("stubs.settlementBody")}
    />
  );
}
