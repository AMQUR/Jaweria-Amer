"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

/** Click-to-load, privacy-enhanced YouTube player: nothing loads from YouTube's player until the visitor presses play. */
export function YouTubeEmbed({
  videoId,
  title,
  kind = "lms_walkthrough",
}: {
  videoId: string;
  title: string;
  kind?: string;
}) {
  const [playing, setPlaying] = useState(false);
  if (!/^[\w-]{11}$/.test(videoId)) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-oxblood text-paper">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="group relative flex h-full w-full items-end text-left focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-paper"
          aria-label={`Play video: ${title}`}
          onClick={() => {
            trackEvent(`${kind}_play`, { media_id: videoId });
            setPlaying(true);
          }}
        >
          <span
            className="absolute inset-0 bg-cover bg-center opacity-70 transition-[scale,opacity] duration-700 group-hover:scale-[1.03] group-hover:opacity-85"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)`,
            }}
            aria-hidden
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-oxblood via-oxblood/30 to-transparent"
            aria-hidden
          />
          <span className="relative flex w-full items-center gap-4 p-4 sm:p-6">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper text-crimson transition-[scale] duration-500 group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            </span>
            <span className="min-w-0 text-[1.05rem] font-semibold leading-snug">
              {title}
              <span className="mt-0.5 block text-[0.8125rem] font-normal text-paper/70">
                Plays on YouTube, here on the page
              </span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
