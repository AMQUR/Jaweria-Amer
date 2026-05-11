"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "community-bar-v1-dismissed";

export function StickyWorkshopBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  const barContent = (
    <div className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2 sm:px-6">
      <p className="min-w-0 flex-1 text-xs font-medium leading-snug text-white sm:text-sm">
        Text us for updates, resources, and help
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-[#ea580c] shadow-sm transition-colors hover:bg-orange-50 sm:text-sm"
        >
          Text us
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed top below nav */}
      <div
        className={cn(
          "fixed left-0 right-0 z-40 hidden bg-[#ea580c] shadow-lg transition-[opacity,transform] duration-300 ease-out sm:block",
          "top-16 sm:top-20",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        )}
        role="banner"
        aria-label="Text us invite"
      >
        {barContent}
      </div>

      {/* Mobile: fixed bottom */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-[#ea580c] shadow-lg transition-[opacity,transform] duration-300 ease-out sm:hidden",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        )}
        role="banner"
        aria-label="Text us invite"
      >
        {barContent}
      </div>
    </>
  );
}
