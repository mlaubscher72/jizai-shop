"use client";

import { useRef, useState } from "react";
import { Lang, t } from "@/lib/i18n";

/**
 * Der Markenfilm — hochkant, 40 Sekunden.
 *
 * Bewusst NICHT vorgeladen: sichtbar ist zuerst nur das Standbild (85 KB),
 * die 21 MB Video holt der Browser erst, wenn jemand auf Play drückt.
 * Sonst würde jeder Besuch der Teaser-Seite die volle Datei ziehen.
 */
const VIDEO = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/brand-media/jizai-house.mp4";
const POSTER = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/brand-media/jizai-house-poster.jpg";

export default function BrandFilm({ lang }: { lang: Lang }) {
  const d = t(lang).teaser;
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  function play() {
    setStarted(true);
    // Die Quelle hängt erst nach dem Klick im DOM — ein Tick warten
    requestAnimationFrame(() => ref.current?.play().catch(() => {}));
  }

  return (
    <figure className="film">
      <div className={`film-frame${started ? " is-playing" : ""}`}>
        <video
          ref={ref}
          className="film-video"
          poster={POSTER}
          preload="none"
          playsInline
          controls={started}
          src={started ? VIDEO : undefined}
        />
        {!started && (
          <button className="film-play" onClick={play} data-hover aria-label={d.filmCta}>
            <span className="film-play-ring" aria-hidden="true">
              <span className="film-play-tri" />
            </span>
            <span className="film-play-label">{d.filmCta}</span>
          </button>
        )}
      </div>
    </figure>
  );
}
