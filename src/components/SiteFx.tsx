"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Globale Effekte: Custom Cursor + Nav-Verhalten beim Scrollen. */
export default function SiteFx() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    /* Shot-Mode für Screenshots (?shot=1) */
    const shotParams = new URLSearchParams(location.search);
    if (shotParams.has("shot")) {
      document.documentElement.classList.add("shot-mode");
      const y = parseInt(shotParams.get("y") || "", 10);
      const sel = shotParams.get("sec");
      requestAnimationFrame(() => {
        if (sel) {
          const el = document.querySelector(sel);
          if (el) document.body.style.transform = `translateY(${-el.getBoundingClientRect().top}px)`;
        } else if (!isNaN(y)) {
          document.body.style.transform = `translateY(${-y}px)`;
        }
      });
    }

    /* Custom Cursor */
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    if (dot && ring && finePointer && !reduceMotion) {
      let mx = -100, my = -100, rx = -100, ry = -100;
      let raf = 0;
      const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
      window.addEventListener("mousemove", onMove);
      const loop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const onOver = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest("a, button, input, select, textarea, [data-hover]")) {
          ring.classList.add("is-hover");
        } else {
          ring.classList.remove("is-hover");
        }
      };
      document.addEventListener("mouseover", onOver);
      cleanups.push(() => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseover", onOver);
        cancelAnimationFrame(raf);
      });
    }

    /* Nav: Glass-Effekt + verstecken beim Runterscrollen */
    const nav = document.getElementById("nav");
    if (nav) {
      let lastY = 0;
      const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle("is-scrolled", y > 40);
        nav.classList.toggle("is-hidden", y > 500 && y > lastY);
        lastY = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
