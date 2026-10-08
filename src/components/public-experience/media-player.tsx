"use client";
import { useRef, useState } from "react";
import { PlayCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/** Native, click-to-load media. HTTPS only; no arbitrary embeds or third-party scripts. */
export function MediaPlayer({
  src,
  poster,
  title,
  id,
  kind = "demo_lesson",
}: {
  src: string;
  poster?: string;
  title: string;
  id: string;
  kind?: "demo_lesson" | "lms_walkthrough";
}) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const progress = useRef(new Set<number>());
  const viewed = useRef(false);
  const safe = /^https:\/\//.test(src);
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#29181d] text-white">
      {!safe || failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
          <PlayCircle className="h-9 w-9 text-rose-200" aria-hidden />
          <p className="text-sm font-medium">
            {failed
              ? "This video could not be loaded."
              : "Approved lesson video coming soon"}
          </p>
          <p className="max-w-xs text-xs leading-relaxed text-white/70">
            {failed
              ? "Check your connection and try again."
              : "We’ll add the recording here once it is ready."}
          </p>
          {failed && (
            <button
              className="min-h-11 rounded-lg border border-white/40 px-4 text-sm"
              onClick={() => {
                setFailed(false);
                setPlaying(false);
              }}
            >
              Try again
            </button>
          )}
        </div>
      ) : !playing ? (
        <button
          type="button"
          className="relative flex h-full w-full items-center justify-center focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-rose-200"
          aria-label={`Load ${title}`}
          onClick={() => {
            setPlaying(true);
            if (!viewed.current) {
              trackEvent(`${kind}_view`, { media_id: id });
              viewed.current = true;
            }
          }}
        >
          {/* A poster is optional until the owner supplies approved imagery. */}
          {poster && /^https:\/\//.test(poster) && (
            <span
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{ backgroundImage: `url(${JSON.stringify(poster)})` }}
            />
          )}
          <span className="relative flex flex-col items-center gap-3">
            <PlayCircle className="h-14 w-14" aria-hidden />
            <span className="text-sm font-semibold">Watch {title}</span>
          </span>
        </button>
      ) : (
        <video
          className="h-full w-full"
          src={src}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
          onError={() => setFailed(true)}
          onPlay={() => trackEvent(`${kind}_play`, { media_id: id })}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (!Number.isFinite(video.duration) || video.duration <= 0) return;
            for (const milestone of [25, 50, 75])
              if (
                (video.currentTime / video.duration) * 100 >= milestone &&
                !progress.current.has(milestone)
              ) {
                progress.current.add(milestone);
                trackEvent(`${kind}_progress`, { media_id: id, milestone });
              }
          }}
          onEnded={() => trackEvent(`${kind}_complete`, { media_id: id })}
        />
      )}
    </div>
  );
}
