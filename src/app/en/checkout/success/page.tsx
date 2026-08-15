import type { Metadata } from "next";
import SuccessView from "@/components/pages/SuccessView";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${t("en").successTitle} — JIZAI`,
  robots: { index: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <SuccessView lang="en" orderId={order} />;
}
