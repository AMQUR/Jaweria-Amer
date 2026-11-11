"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { publicExperience } from "@/lib/public-experience";
import { trackEvent } from "@/lib/analytics";
import { Arrow } from "@/components/editorial/arrow";

/** Announcement strip in normal flow under the fixed nav: never covers navigation or forms. */
export function StickyWorkshopBar({
  active = false,
  batch = publicExperience.batch,
}: {
  active?: boolean;
  batch?: { headline: string; message: string; cta: string; href: string };
}) {
  const [dismissed, setDismissed] = useState(false);
  const viewed = useRef(false);
  useEffect(() => {
    if (active && !viewed.current) {
      trackEvent("batch_banner_view");
      viewed.current = true;
    }
  }, [active]);
  if (!active) return null;
  return (
    <div className="pt-16 sm:pt-[4.25rem]">
      {!dismissed && (
        <aside aria-label="New batches" className="ed-ink">
          <div className="ed-wrap flex min-h-12 items-center gap-x-5 gap-y-1 py-1.5 text-[0.9rem]">
            <p className="min-w-0 flex-1 leading-snug text-paper/80 max-[400px]:sr-only">
              <strong className="font-semibold text-paper">
                {batch.headline}{" "}
              </strong>
              <span className="max-sm:hidden">{batch.message}</span>
            </p>
            <a
              href={batch.href}
              className="ed-link shrink-0 text-[#f6c9c1] max-[400px]:mr-auto"
              onClick={() => {
                trackEvent("batch_banner_click");
                trackEvent("registration_cta_click", {
                  surface: "batch_banner",
                });
              }}
            >
              {batch.cta}
              <Arrow />
            </a>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper focus-visible:outline-2 focus-visible:outline-paper"
              aria-label="Dismiss batch announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
