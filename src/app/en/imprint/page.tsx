import type { Metadata } from "next";
import LegalPageView from "@/components/pages/LegalPageView";
import { langAlternates } from "@/lib/i18n";
import { IMPRINT } from "@/lib/legal";

export const metadata: Metadata = {
  title: `${IMPRINT.en.title} — JIZAI`,
  description: IMPRINT.en.intro,
  alternates: langAlternates("en", "/impressum"),
};

export default function Page() {
  return <LegalPageView lang="en" doc={IMPRINT.en} />;
}
