"use client";
import { useEffect, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";
import type Hls from "hls.js";
import { trackEvent } from "@/lib/analytics";
import { RegistrationLink } from "./registration-link";

/** Click-to-load native controls, with a separately loaded HLS adapter when needed. */
export function MediaPlayer({
  src,
  poster,
  title,
  id,
  kind = "demo_lesson",
  captions,
}: {
  src: string;
  poster?: string;
  title: string;
  id: string;
  kind?: "demo_lesson" | "lms_walkthrough";
  captions?: { src: string; language: string; label: string };
}) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [engaged, setEngaged] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useRef(new Set<number>());
  const viewed = useRef(false);
  const watched = useRef(0);
  const previousTime = useRef(0);
  const savedTime = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const safe = /^https:\/\//.test(src);
  useEffect(() => {
    const element = container.current;
    if (!element || !safe) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !viewed.current) {
          viewed.current = true;
          trackEvent(`${kind}_view`, { media_id: id });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [id, kind, safe]);
  useEffect(() => {
    const video = videoRef.current;
    if (!playing || !safe || !video || failed) return;
    let disposed = false;
    let stream: Hls | undefined;
    async function load() {
      if (!src.endsWith(".m3u8")) {
        video!.src = src;
        return;
      }
      const { default: Adapter } = await import("hls.js");
      if (disposed) return;
      if (Adapter.isSupported()) {
        stream = new Adapter({
          maxBufferLength: 20,
          maxMaxBufferLength: 30,
          maxBufferSize: 10 * 1024 * 1024,
        });
        stream.on(Adapter.Events.ERROR, (_event, data) => {
          if (data.fatal && !disposed) setFailed(true);
        });
        stream.loadSource(src);
        stream.attachMedia(video!);
      } else if (video!.canPlayType("application/vnd.apple.mpegurl"))
        video!.src = src;
      else setFailed(true);
    }
    load().catch(() => {
      if (!disposed) setFailed(true);
    });
    return () => {
      disposed = true;
      stream?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [playing, safe, src, failed]);
  return (
    <div ref={container}>
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
                  setLoading(true);
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
            aria-label={`Watch ${title}`}
            onClick={() => setPlaying(true)}
          >
            {poster && /^https:\/\//.test(poster) && (
              <span
                className="absolute inset-0 bg-cover bg-center opacity-50"
                style={{ backgroundImage: `url(${JSON.stringify(poster)})` }}
              />
            )}
            <span className="relative flex flex-col items-center gap-3 px-4 text-center">
              <PlayCircle className="h-14 w-14" aria-hidden />
              <span className="text-sm font-semibold">Watch {title}</span>
            </span>
          </button>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full"
              poster={poster || undefined}
              controls
              playsInline
              preload="metadata"
              aria-label={title}
              onError={() => setFailed(true)}
              onWaiting={() => setLoading(true)}
              onCanPlay={() => setLoading(false)}
              onPlaying={() => setLoading(false)}
              onLoadedMetadata={(event) => {
                try {
                  const time = Number(
                    localStorage.getItem(`lesson-resume:${id}`),
                  );
                  if (
                    Number.isFinite(time) &&
                    time > 0 &&
                    time < event.currentTarget.duration - 5
                  )
                    event.currentTarget.currentTime = time;
                } catch {
                  /* Browser storage is optional. */
                }
              }}
              onPlay={(event) => {
                previousTime.current = event.currentTarget.currentTime;
                trackEvent(`${kind}_play`, { media_id: id });
              }}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;
                const delta = video.currentTime - previousTime.current;
                previousTime.current = video.currentTime;
                if (!video.paused && delta > 0 && delta < 2)
                  watched.current += delta;
                if (watched.current >= 30 && !engaged) setEngaged(true);
                if (Math.abs(video.currentTime - savedTime.current) >= 10) {
                  savedTime.current = video.currentTime;
                  try {
                    localStorage.setItem(
                      `lesson-resume:${id}`,
                      String(video.currentTime),
                    );
                  } catch {
                    /* Optional. */
                  }
                }
                if (!Number.isFinite(video.duration) || video.duration <= 0)
                  return;
                for (const milestone of [25, 50, 75])
                  if (
                    (video.currentTime / video.duration) * 100 >= milestone &&
                    !progress.current.has(milestone)
                  ) {
                    progress.current.add(milestone);
                    trackEvent(`${kind}_progress`, { media_id: id, milestone });
                  }
              }}
              onEnded={() => {
                trackEvent(`${kind}_complete`, { media_id: id });
                try {
                  localStorage.removeItem(`lesson-resume:${id}`);
                } catch {
                  /* Optional. */
                }
              }}
            >
              {captions && /^https:\/\//.test(captions.src) && (
                <track
                  kind="captions"
                  src={captions.src}
                  srcLang={captions.language}
                  label={captions.label}
                />
              )}
            </video>
            {loading && (
              <p
                role="status"
                className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/70 px-3 py-2 text-xs"
              >
                Loading your lesson…
              </p>
            )}
          </>
        )}
      </div>
      {engaged && kind === "demo_lesson" && (
        <div className="mt-4 rounded-xl bg-rose-50 p-4">
          <p className="text-sm leading-relaxed text-ink">
            Enjoyed this lesson? Learn the complete syllabus with Miss Jay.
          </p>
          <RegistrationLink
            surface="lesson_engagement"
            className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-crimson underline"
          >
            Join the Next Batch
          </RegistrationLink>
        </div>
      )}
    </div>
  );
}
