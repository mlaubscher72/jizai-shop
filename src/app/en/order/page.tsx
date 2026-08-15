import type { Metadata } from "next";
import OrderView from "@/components/pages/OrderView";
import { langAlternates, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("en").orderMetaTitle,
  description: t("en").orderMetaDescription,
  alternates: langAlternates("en", "/bestellung"),
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; locked?: string }>;
}) {
  const { error, locked } = await searchParams;
  return <OrderView lang="en" error={error} locked={locked} />;
}
