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
        "fixed z-40 flex h-12 w-12 items-center justify-center bg-[#25D366] text-white shadow-lg ring-2 ring-crimson/50 transition-colors duration-300 hover:bg-[#20BD5A] hover:ring-rose hover:shadow-xl",
        "right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
        onRegistration && "max-lg:hidden",
      )}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
