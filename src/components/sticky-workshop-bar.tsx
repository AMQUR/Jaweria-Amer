"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { publicExperience } from "@/lib/public-experience";
import { trackEvent } from "@/lib/analytics";

/** Existing announcement surface, now in normal flow: never covers navigation or forms. */
export function StickyWorkshopBar({ active = false }: { active?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const viewed = useRef(false);
  useEffect(() => {
    if (active && !viewed.current) {
      trackEvent("batch_banner_view");
      viewed.current = true;
    }
  }, [active]);
  if (!active) return null;
  const batch = publicExperience.batch;
  return (
    <div className="pt-16 sm:pt-[4.25rem]">
      <aside
        aria-label="New batches"
        className="border-y border-crimson/15 bg-rose-50"
      >
        <div className="mx-auto relative flex min-h-24 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:min-h-20 sm:flex-nowrap sm:px-6 lg:px-8">
          {!dismissed && (
            <>
              <Sparkles
                className="hidden h-6 w-6 shrink-0 text-crimson motion-safe:animate-pulse sm:block"
                aria-hidden
              />
              <p className="min-w-0 basis-full pr-10 text-sm sm:basis-auto sm:flex-1 sm:pr-0 leading-relaxed text-ink">
                <strong className="block sm:inline">{batch.headline} </strong>
                {batch.message}
              </p>
              <a
                href={batch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                onClick={() => {
                  trackEvent("batch_banner_click");
                  trackEvent("registration_cta_click", {
                    surface: "batch_banner",
                  });
                }}
              >
                {batch.cta}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="absolute right-2 top-2 flex h-11 w-11 shrink-0 sm:static items-center justify-center rounded-xl text-slate hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-crimson"
                aria-label="Dismiss batch announcement"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          {dismissed && (
            <p className="text-sm text-slate">
              English with Miss Jay · Learn. Practise. Improve.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
