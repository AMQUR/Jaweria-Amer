"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { REGISTRATION_PATH } from "@/lib/registration/mobile";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const onRegistration = usePathname() === REGISTRATION_PATH;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-crimson text-white shadow-lg transition-all duration-300 hover:border-rose/40 hover:text-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-crimson",
        "right-[max(1rem,env(safe-area-inset-right))] bottom-[max(6rem,calc(env(safe-area-inset-bottom)+4.5rem))]",
        onRegistration && "max-lg:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
