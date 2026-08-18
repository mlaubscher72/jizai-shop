import type { Metadata } from "next";
import LegalPageView from "@/components/pages/LegalPageView";
import { langAlternates } from "@/lib/i18n";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: `${PRIVACY.de.title} — JIZAI`,
  description: PRIVACY.de.intro,
  alternates: langAlternates("de", "/datenschutz"),
};

export default function Page() {
  return <LegalPageView lang="de" doc={PRIVACY.de} />;
}
