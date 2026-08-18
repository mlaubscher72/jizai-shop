import type { Metadata } from "next";
import LegalPageView from "@/components/pages/LegalPageView";
import { langAlternates } from "@/lib/i18n";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: `${PRIVACY.en.title} — JIZAI`,
  description: PRIVACY.en.intro,
  alternates: langAlternates("en", "/datenschutz"),
};

export default function Page() {
  return <LegalPageView lang="en" doc={PRIVACY.en} />;
}
