"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import LangSwitch from "./LangSwitch";
import { langFromPath, localePath, switchPath, t } from "@/lib/i18n";

export default function Nav() {
  const { count, setOpen } = useCart();
  const pathname = usePathname();

  /* Nav sitzt im Root-Layout und bekommt keine Server-Props — Sprache aus dem Pfad */
  const lang = langFromPath(pathname);
  const d = t(lang);
  const home = localePath(lang, "/");
  const isHome = pathname === home;
  const anchor = (id: string) => (isHome ? `#${id}` : `${home}#${id}`);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="nav" id="nav">
      <Link className="nav-logo" href={home} data-hover>
        <span className="nav-logo-word">JIZAI</span>
        <span className="nav-logo-kana">ジザイ</span>
      </Link>
      <nav className="nav-links">
        <Link href={anchor("philosophy")} data-hover>
          {d.navPhilosophy}
        </Link>
        <Link href={anchor("drop")} data-hover>
          {d.navDrop}
        </Link>
        <Link href={anchor("shuhari")} data-hover>
          守破離 <span className="nav-sub">{d.navShuhariSub}</span>
        </Link>
        <Link href={anchor("about")} data-hover>
          {d.navAbout}
        </Link>

        <LangSwitch lang={lang} href={switchPath(pathname)} className="nav-lang" />

        <button className="nav-cart" data-hover onClick={() => setOpen(true)} aria-label={d.navCartOpen}>
          <span className="nav-cart-label">{d.navCart}</span>
          <span className="nav-cart-count">{count}</span>
        </button>
      </nav>
    </header>
  );
}
