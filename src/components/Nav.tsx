"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";

export default function Nav() {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="nav" id="nav">
      <Link className="nav-logo" href="/" data-hover>
        <span className="nav-logo-word">JIZAI</span>
        <span className="nav-logo-kana">ジザイ</span>
      </Link>
      <nav className="nav-links">
        <Link href={isHome ? "#philosophy" : "/#philosophy"} data-hover>
          Philosophie
        </Link>
        <Link href={isHome ? "#drop" : "/#drop"} data-hover>
          Drop 01
        </Link>
        <Link href={isHome ? "#shuhari" : "/#shuhari"} data-hover>
          守破離
        </Link>
        <Link href={isHome ? "#about" : "/#about"} data-hover>
          About
        </Link>
        <button className="nav-cart" data-hover onClick={() => setOpen(true)} aria-label="Warenkorb öffnen">
          <span className="nav-cart-label">Cart</span>
          <span className="nav-cart-count">{count}</span>
        </button>
      </nav>
    </header>
  );
}
