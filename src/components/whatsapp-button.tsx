"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { whatsAppGroupUrl } from "@/lib/contact";
import { trackWhatsAppClick } from "@/lib/analytics";
import { REGISTRATION_PATH } from "@/lib/registration/mobile";
import { cn } from "@/lib/utils";

export function WhatsAppButton() {
  const url = whatsAppGroupUrl();
  const onRegistration = usePathname() === REGISTRATION_PATH;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Text us on WhatsApp"
      onClick={() =>
        trackWhatsAppClick({ location: "floating_button", variant: "group" })
      }
      className={cn(
        "fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1f9d4d] text-white shadow-lg ring-2 ring-paper transition-colors duration-300 hover:bg-[#178a41] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        "right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
        onRegistration && "max-lg:hidden",
      )}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
