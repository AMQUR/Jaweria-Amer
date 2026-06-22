/**
 * Single source of truth for contact info and WhatsApp direct-chat link.
 * All WhatsApp entry points open a direct chat with the teacher.
 */

const WHATSAPP_DIRECT_URL = "https://wa.me/923253708069";

/** Paid enrolment form — the primary conversion CTA across the site. */
export const ENROL_NOW_URL = "https://forms.gle/LbYPC63MWP1foWZC6";

/** Public WhatsApp community group ("Join Our Community" secondary CTA). */
export const COMMUNITY_WHATSAPP_URL = "https://chat.whatsapp.com/KEDYUPcMemQENBf3H053jf?mode=gi_t";

export const contact = {
  phone: "+923253708069",
  youtube: "https://youtube.com/@englishwithmissjay?si=eaaHaSzNSPLDratp",
  /** Stable featured lesson for the About page embed (`youtube.com/watch?v=…` ID). */
  youtubeFeaturedVideoId: "JKrLqtVcdso",
  // TODO: Replace with the real Instagram profile URL when supplied. The user temporarily
  // provided the WhatsApp community link as a stand-in for Instagram; we keep this existing
  // handle as the better-known link until the real one is confirmed.
  instagram: "https://instagram.com/englishwithmissjay",
  /** Public Facebook page — leave empty to hide the Facebook card on marketing pages. */
  facebook: "https://www.facebook.com/jaweria.amer",
  email: "jaweriaamer001@gmail.com",
  /** Public-facing location line (footer, etc.). */
  locationLine: "Karachi, Pakistan",
} as const;

export function telUrl(): string {
  return `tel:${contact.phone.replace(/\s/g, "")}`;
}

/** Returns the WhatsApp direct-chat link for the teacher. */
export function whatsAppGroupUrl(): string {
  return WHATSAPP_DIRECT_URL;
}

/** Alias for whatsAppGroupUrl — use this in all components. */
export function getWhatsAppUrl(): string {
  return WHATSAPP_DIRECT_URL;
}

export function workshopRegisterUrl(): string {
  return WHATSAPP_DIRECT_URL;
}

/**
 * Returns true if the URL is a WhatsApp community/group link (chat.whatsapp.com).
 * Used to block CMS-injected community links — all CTAs should use direct chat.
 */
export function isInvalidWhatsAppLink(url: string): boolean {
  return url.includes("chat.whatsapp.com");
}

/** Privacy-enhanced single-video embed for marketing (no playlist / uploads params). */
export function youtubeFeaturedEmbedSrc(): string {
  return `https://www.youtube-nocookie.com/embed/${contact.youtubeFeaturedVideoId}`;
}
