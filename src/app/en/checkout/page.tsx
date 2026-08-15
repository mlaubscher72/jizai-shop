import type { Metadata } from "next";
import CheckoutView from "@/components/pages/CheckoutView";
import { langAlternates, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("en").checkoutTitle} — JIZAI`,
  robots: { index: false },
  alternates: langAlternates("en", "/checkout"),
};

export default function Page() {
  return <CheckoutView lang="en" />;
}
