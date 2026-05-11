"use client";

import { MessageCircle } from "lucide-react";
import { whatsAppGroupUrl } from "@/lib/contact";
import { trackWhatsAppClick } from "@/lib/analytics";

export function WhatsAppButton() {
  const url = whatsAppGroupUrl();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Text us on WhatsApp"
      onClick={() => trackWhatsAppClick({ location: "floating_button", variant: "group" })}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] p-3.5 text-white shadow-lg ring-2 ring-crimson/50 transition-all duration-300 hover:scale-105 hover:bg-[#20BD5A] hover:ring-rose hover:shadow-xl"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
