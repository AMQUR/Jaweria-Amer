/**
 * Single source of truth for contact info and WhatsApp community link.
 * All WhatsApp entry points go to the community — direct messaging is not supported.
 */

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/I9p7rCopafq51oG93lJAap";

export const contact = {
  phone: "+923253708069",
  youtube: "https://www.youtube.com/@englishwithjaweria",
  /** Stable featured lesson for the About page embed (`youtube.com/watch?v=…` ID). */
  youtubeFeaturedVideoId: "Qyl5kB_uv-0",
  drive: "https://drive.google.com/drive/folders/1B3MN_5TiHfknp6Ao4BwlFRlmc89F1AHF",
  instagram: "https://instagram.com/englishwithjaweria",
  /** Public Facebook page — leave empty to hide the Facebook card on marketing pages. */
  facebook: "https://www.facebook.com/jaweria.amer",
  email: "jaweriaamer001@gmail.com",
  /** Public-facing location line (footer, etc.). */
  locationLine: "Karachi, Pakistan",
} as const;

export function telUrl(): string {
  return `tel:${contact.phone.replace(/\s/g, "")}`;
}

/** Returns the WhatsApp community invite link. */
export function whatsAppGroupUrl(): string {
  return WHATSAPP_COMMUNITY_URL;
}

/** Alias for whatsAppGroupUrl — use this in all components. */
export function getWhatsAppUrl(): string {
  return WHATSAPP_COMMUNITY_URL;
}

export function workshopRegisterUrl(): string {
  return WHATSAPP_COMMUNITY_URL;
}

/**
 * Returns true if the URL is a direct WhatsApp link (wa.me, api.whatsapp.com,
 * or contains a phone number). Used to block CMS-injected direct links.
 */
export function isInvalidWhatsAppLink(url: string): boolean {
  return (
    url.includes("wa.me") ||
    url.includes("api.whatsapp.com") ||
    /\d{8,}/.test(url)
  );
}

/** Privacy-enhanced single-video embed for marketing (no playlist / uploads params). */
export function youtubeFeaturedEmbedSrc(): string {
  return `https://www.youtube-nocookie.com/embed/${contact.youtubeFeaturedVideoId}`;
}
