import type { Metadata } from "next";
import HomeView from "@/components/pages/HomeView";
import { langAlternates, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("en").metaTitle,
  description: t("en").metaDescription,
  alternates: langAlternates("en", "/"),
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vorschau?: string }>;
}) {
  const { vorschau } = await searchParams;
  return <HomeView lang="en" preview={vorschau} />;
}
