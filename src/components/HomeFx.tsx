"use client";

import { useEffect } from "react";

/**
 * Animationen der Startseite: Preloader, Reveals, Enso-Draw,
 * Hero-Parallax und horizontaler Drop-Scroll — portiert von der statischen Site.
 */
export default function HomeFx() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shotMode = document.documentElement.classList.contains("shot-mode");
    const cleanups: (() => void)[] = [];

    /* Preloader */
    const preloader = document.getElementById("preloader");
    if (preloader) {
      if (shotMode) {
        preloader.classList.add("is-done");
        document.body.classList.add("is-loaded");
      } else {
        const t = setTimeout(() => {
          preloader.classList.add("is-done");
          document.body.classList.add("is-loaded");
        }, reduceMotion ? 100 : 2100);
        cleanups.push(() => clearTimeout(t));
      }
    } else {
      document.body.classList.add("is-loaded");
    }

    /* Split words */
    document.querySelectorAll(".split-words:not(.sw-done)").forEach((el) => {
      const words = (el.textContent || "").trim().split(/\s+/);
      el.innerHTML = words
        .map((w, i) => `<span class="sw"><i style="--i:${i}">${w}</i></span>`)
        .join(" ");
      el.classList.add("sw-done");
    });

    /* Reveals */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal-line, .reveal-fade, .split-words").forEach((el) => {
      if (shotMode) { el.classList.add("in-view"); return; }
      io.observe(el);
    });
    cleanups.push(() => io.disconnect());

    /* Enso-Draw: Pinsel-Ring zeichnet sich per Conic-Mask entlang des Strichs */
    const ensoBrush = document.getElementById("ensoBrush");
    const ensoWrap = document.querySelector(".manifesto-enso");
    if (ensoBrush && ensoWrap) {
      const FULL_ARC = 342; // Grad — lässt die Öffnung des Enso frei (mushin)
      if (reduceMotion || shotMode) {
        ensoBrush.style.setProperty("--enso-arc", `${FULL_ARC}deg`);
        ensoWrap.classList.add("enso-done");
      } else {
        const drawEnso = () => {
          const rect = ensoWrap.getBoundingClientRect();
          const vh = window.innerHeight;
          const p = Math.min(Math.max((vh - rect.top) / (vh * 0.9), 0), 1);
          ensoBrush.style.setProperty("--enso-arc", `${p * FULL_ARC}deg`);
          ensoWrap.classList.toggle("enso-done", p > 0.97);
        };
        window.addEventListener("scroll", drawEnso, { passive: true });
        drawEnso();
        cleanups.push(() => window.removeEventListener("scroll", drawEnso));
      }
    }

    /* Hero-Parallax */
    const heroImg = document.getElementById("heroImg");
    if (heroImg && !reduceMotion && !shotMode) {
      const onScroll = () => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroImg.style.transform = `scale(${1.12 - Math.min(y / 8000, 0.06)}) translateY(${y * 0.18}px)`;
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    /* Drop: horizontaler Scroll-Jack */
    const dropSection = document.querySelector<HTMLElement>(".drop");
    const dropTrack = document.getElementById("dropTrack");
    const dropSticky = document.querySelector<HTMLElement>(".drop-sticky");
    const dropIndexEl = document.getElementById("dropIndex");
    const pieces = document.querySelectorAll<HTMLElement>(".piece");
    if (dropSection && dropTrack && dropSticky && dropIndexEl && pieces.length) {
      const isMobile = () => window.matchMedia("(max-width: 760px)").matches;
      const hexToRgba = (hex: string, a: number) => {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
      };
      const setHeight = () => {
        if (isMobile()) { dropSection.style.height = "auto"; return; }
        const overflowX = dropTrack.scrollWidth - window.innerWidth;
        dropSection.style.height = `${window.innerHeight + Math.max(overflowX, 0)}px`;
      };
      const update = () => {
        if (isMobile()) return;
        const rect = dropSection.getBoundingClientRect();
        const total = dropSection.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const p = Math.min(Math.max(-rect.top / total, 0), 1);
        const overflowX = dropTrack.scrollWidth - window.innerWidth;
        dropTrack.style.transform = `translateX(${-p * overflowX}px)`;
        const idx = Math.min(Math.floor(p * pieces.length), pieces.length - 1);
        dropIndexEl.textContent = String(idx + 1).padStart(2, "0");
        const accent = pieces[idx].dataset.accent;
        if (accent) dropSticky.style.setProperty("--piece-glow", hexToRgba(accent, 0.16));
      };
      setHeight();
      update();
      window.addEventListener("resize", setHeight);
      window.addEventListener("scroll", update, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("resize", setHeight);
        window.removeEventListener("scroll", update);
      });
    }

    /* Lookbook-Parallax */
    const lbItems = document.querySelectorAll<HTMLElement>(".lb-item");
    if (lbItems.length && !reduceMotion && !shotMode) {
      const onScroll = () => {
        lbItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const speed = parseFloat(item.dataset.speed || "0");
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
          item.style.transform = `translateY(${offset}px)`;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
