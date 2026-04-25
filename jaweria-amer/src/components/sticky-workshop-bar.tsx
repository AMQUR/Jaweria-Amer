"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { workshopRegisterUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

/**
 * Slim fixed bar below the main navbar on the homepage after ~150px scroll.
 */
export function StickyWorkshopBar() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (pathname !== "/") return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    queueMicrotask(onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const visible = pathname === "/" && scrollY > 150;

  if (pathname !== "/") return null;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        "top-16 sm:top-20",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      )}
      role="region"
      aria-label="Workshop promotion"
      aria-hidden={!visible}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/15 bg-brand px-4 py-2 shadow-md sm:min-h-12 sm:px-6">
        <p className="min-w-0 flex-1 text-xs font-medium leading-snug text-white sm:text-sm">
          English Writing Workshop — <span className="font-semibold">Limited Seats</span>
        </p>
        <TrackedWhatsAppLink
          href={workshopRegisterUrl()}
          location="sticky_workshop_bar"
          variant="group"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-center text-xs font-semibold text-brand shadow-sm transition-colors hover:bg-brand-soft sm:px-4 sm:text-sm"
        >
          Reserve Now
        </TrackedWhatsAppLink>
      </div>
    </div>
  );
}
