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
  primaryCtaText: "Text us",
  primaryCtaLink: "https://wa.me/923253708069",
  secondaryCtaText: "Text us",
  secondaryCtaLink: "https://wa.me/923253708069",
  bannerImagePath: "/assets/miss-jay.png",
  updatedAt: STATIC_RECORD_TIMESTAMP,
};

export const defaultSettings = {
  whatsappNumber: "923253708069",
  stats: [
    { value: "3+", label: "Years Teaching Experience" },
    // Mirrors the verified M/J 2026 figure (86.0% of 293 publicly shared result
    // records); scripts/test-mj26-results.ts fails if this drifts from the dataset.
    { value: "86%", label: "A or A* in M/J 2026 shared results" },
    { value: "6", label: "CAIE Exam Sessions" },
  ],
} as const;
