import { siteConfig } from "@/lib/data";
import type { HomepageContent } from "./cms-types";

const STATIC_RECORD_TIMESTAMP = "2024-01-01T00:00:00.000Z";

/** Client-safe defaults (no `fs` / `server-only`). */
export const defaultHomepageContent: HomepageContent = {
  heroKicker: siteConfig.brandSubtitle,
  heroTitlePrimary: "Master CAIE English",
  heroTitleSecondary: "with Clarity and Care",
  heroDescription:
    "Rubric-driven instruction, calm accountability, and mentorship that builds independent thinkers. Structured practice that holds up on exam day.",
  primaryCtaText: "Book a Clarity Call",
  primaryCtaLink: "/contact/whatsapp-primary",
  secondaryCtaText: "Join WhatsApp group",
  secondaryCtaLink: "/contact/whatsapp-group",
  bannerImagePath: "/assets/hero-premium.jpg",
  updatedAt: STATIC_RECORD_TIMESTAMP,
};

export const defaultSettings = {
  whatsappNumber: "923253708069",
  stats: [
    { value: "3+", label: "Years Teaching Experience" },
    { value: "80%", label: "Students scored A+/A" },
    { value: "6", label: "CAIE Exam Sessions" },
  ],
} as const;
