"use client";

import Link from "next/link";
import { Lang, t } from "@/lib/i18n";

/**
 * DE/EN-Umschalter. Merkt die Wahl in einem Cookie — danach leitet die
 * automatische Browsersprach-Erkennung (src/proxy.ts) nie mehr um.
 */
export default function LangSwitch({
  lang,
  href,
  className,
}: {
  lang: Lang;
  href: string;
  className: string;
}) {
  const d = t(lang);
  const target: Lang = lang === "de" ? "en" : "de";

  function remember() {
    document.cookie = `jizai_lang=${target}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={remember}
      data-hover
      hrefLang={target}
      aria-label={d.langSwitchLabel}
      title={d.langSwitchLabel}
    >
      <span className={lang === "de" ? "is-active" : undefined}>DE</span>
      <i aria-hidden="true">/</i>
      <span className={lang === "en" ? "is-active" : undefined}>EN</span>
    </Link>
  );
}
