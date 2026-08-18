import type { Metadata } from "next";
import LegalPageView from "@/components/pages/LegalPageView";
import { langAlternates } from "@/lib/i18n";
import { IMPRINT } from "@/lib/legal";

export const metadata: Metadata = {
  title: `${IMPRINT.de.title} — JIZAI`,
  description: IMPRINT.de.intro,
  alternates: langAlternates("de", "/impressum"),
};

export default function Page() {
  return <LegalPageView lang="de" doc={IMPRINT.de} />;
}
