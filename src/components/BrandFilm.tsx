"use client";

import { useRef, useState } from "react";
import { Lang, t } from "@/lib/i18n";

/**
 * Der Markenfilm — hochkant, 40 Sekunden.
 *
 * Sichtbar ist zuerst nur das Standbild (86 KB). Erst beim Klick auf Play
 * wird der Film geladen. Das hat zwei Gründe:
 *   - ohne Klick zieht kein Besuch die volle Videodatei
 *   - bei YouTube wird vor dem Klick nichts von Google geladen und kein
 *     Cookie gesetzt — deshalb braucht die Seite keinen Consent-Banner
 *
 * Ist im Backend eine YouTube-ID hinterlegt, läuft der Film über YouTube
 * (kostet kein Supabase-Kontingent). Sonst über die eigene Datei.
 */
const VIDEO = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/brand-media/jizai-house.mp4";
const POSTER = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/brand-media/jizai-house-poster.jpg";

export default function BrandFilm({ lang, youtubeId }: { lang: Lang; youtubeId?: string | null }) {
  const d = t(lang).teaser;
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  function play() {
    setStarted(true);
    if (!youtubeId) {
      // Die Quelle hängt erst nach dem Klick im DOM — ein Tick warten
      requestAnimationFrame(() => ref.current?.play().catch(() => {}));
    }
  }

  return (
    <figure className="film">
      <div className={`film-frame${started ? " is-playing" : ""}`}>
        {youtubeId ? (
          started ? (
            <iframe
              className="film-embed"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="JIZAI"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="film-poster" src={POSTER} alt="" loading="lazy" />
          )
        ) : (
          <video
            ref={ref}
            className="film-video"
            poster={POSTER}
            preload="none"
            playsInline
            controls={started}
            src={started ? VIDEO : undefined}
          />
        )}

        {!started && (
          <button className="film-play" onClick={play} data-hover aria-label={d.filmCta}>
            <span className="film-play-ring" aria-hidden="true">
              <span className="film-play-tri" />
            </span>
            <span className="film-play-label">{d.filmCta}</span>
          </button>
        )}
      </div>
      {youtubeId && !started && <figcaption className="film-note">{d.filmYoutubeNote}</figcaption>}
    </figure>
  );
}
