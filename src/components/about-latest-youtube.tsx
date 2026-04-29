"use client";

import { useCallback, useState } from "react";
import { ExternalLink } from "lucide-react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact, youtubeFeaturedEmbedSrc } from "@/lib/contact";

const EMBED_SRC = youtubeFeaturedEmbedSrc();

/**
 * Stable YouTube embed with fallback only if the iframe element fires `onError`
 * (e.g. network failure loading the frame — not heuristic timeouts).
 */
export function AboutLatestYoutube() {
  const [iframeFailed, setIframeFailed] = useState(false);

  const handleIframeError = useCallback(() => {
    setIframeFailed(true);
  }, []);

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-muted/30 shadow-[0_8px_32px_rgba(34,16,18,0.08)]">
      <div className="relative aspect-video w-full">
        {!iframeFailed && (
          <iframe
            className="absolute inset-0 z-0 h-full w-full"
            src={EMBED_SRC}
            title="Featured lesson — English with Jaweria on YouTube"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onError={handleIframeError}
          />
        )}
        {iframeFailed && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-gradient-to-b from-white/98 to-blush/95 px-6 py-10 text-center sm:px-10"
            role="region"
            aria-label="YouTube video could not be loaded"
          >
            <h3 className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Learn directly from Jaweria
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-slate sm:text-base">
              Full lessons and paper-style breakdowns on YouTube — structured, calm, and aligned to how
              Cambridge marks.
            </p>
            <p className="max-w-md text-xs leading-relaxed text-slate-light sm:text-sm">
              Used by students preparing for Cambridge O Level English exams
            </p>
            <TrackedOutboundLink
              href={contact.youtube}
              channel="youtube"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-crimson px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose"
            >
              Open full channel
              <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
            </TrackedOutboundLink>
          </div>
        )}
      </div>
    </div>
  );
}
