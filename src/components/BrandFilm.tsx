"use client";

import { useEffect, useRef, useState } from "react";
import { Lang, t } from "@/lib/i18n";

/**
 * Der Markenfilm — hochkant, 40 Sekunden.
 *
 * Mit hinterlegter YouTube-ID startet der Film von selbst. Zwei Dinge sind
 * dabei nicht verhandelbar:
 *   - Autoplay geht nur STUMM. Alle Browser blockieren selbststartenden Ton;
 *     `mute=1` ist Bedingung, sonst startet gar nichts.
 *   - Der Player wird erst nach der Hydration eingehängt, nicht schon im
 *     Server-HTML. So bleibt die erste Ansicht das eigene Standbild, und
 *     `prefers-reduced-motion` lässt sich vorher auswerten.
 *
 * Wer im System "Bewegung reduzieren" gesetzt hat, bekommt keinen
 * Selbststart, sondern das Standbild mit Play-Knopf.
 *
 * Ohne YouTube-ID läuft weiter die eigene Datei — die startet bewusst NICHT
 * automatisch, sonst zöge jeder Seitenaufruf 21 MB aus dem Storage.
 */
const VIDEO = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/brand-media/jizai-house.mp4";
const POSTER = "https://pkqnyeonuzittsqtworu.supabase.co/storage/v1/object/public/brand-media/jizai-house-poster.jpg";

function embedUrl(id: string, muted: boolean): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    // loop braucht playlist mit derselben ID — sonst bleibt der Film am Ende
    // auf YouTubes Vorschlags-Kacheln stehen
    loop: "1",
    playlist: id,
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export default function BrandFilm({ lang, youtubeId }: { lang: Lang; youtubeId?: string | null }) {
  const d = t(lang).teaser;
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!youtubeId) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPlaying(true);
  }, [youtubeId]);

  function play() {
    setMuted(false); // ein echter Klick erlaubt Ton
    setPlaying(true);
    if (!youtubeId) {
      requestAnimationFrame(() => ref.current?.play().catch(() => {}));
    }
  }

  return (
    <figure className="film">
      <div className={`film-frame${playing ? " is-playing" : ""}`}>
        {youtubeId ? (
          playing ? (
            <iframe
              className="film-embed"
              src={embedUrl(youtubeId, muted)}
              title="JIZAI"
              allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="film-poster" src={POSTER} alt="" />
          )
        ) : (
          <video
            ref={ref}
            className="film-video"
            poster={POSTER}
            preload="none"
            playsInline
            controls={playing}
            src={playing ? VIDEO : undefined}
          />
        )}

        {!playing && (
          <button className="film-play" onClick={play} data-hover aria-label={d.filmCta}>
            <span className="film-play-ring" aria-hidden="true">
              <span className="film-play-tri" />
            </span>
            <span className="film-play-label">{d.filmCta}</span>
          </button>
        )}
      </div>

      {youtubeId && (
        <figcaption className="film-note">
          {playing && muted ? d.filmMutedNote : !playing ? d.filmYoutubeNote : ""}
        </figcaption>
      )}
    </figure>
  );
}
