import "server-only";

import { getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
import { siteConfig } from "@/lib/data";
import { getWhatsAppUrl, isInvalidWhatsAppLink } from "@/lib/contact";

function sanitizeCtaLink(link: string | undefined): string {
  if (!link || isInvalidWhatsAppLink(link)) {
    return getWhatsAppUrl();
  }
  return link;
}

export async function getHomepageContent() {
  try {
    const stored = await getStoredHomepageContent();
    return {
      ...stored,
      primaryCtaLink: sanitizeCtaLink(stored.primaryCtaLink),
      secondaryCtaLink: sanitizeCtaLink(stored.secondaryCtaLink),
    };
  } catch {
    return {
      heroKicker: siteConfig.brandSubtitle,
      heroTitlePrimary: "Master CAIE English",
      heroTitleSecondary: "with Clarity and Care",
      heroDescription:
        "Rubric-driven instruction, calm accountability, and mentorship that builds independent thinkers. Structured practice that holds up on exam day.",
      primaryCtaText: "Text us",
      primaryCtaLink: getWhatsAppUrl(),
      secondaryCtaText: "Text us",
      secondaryCtaLink: getWhatsAppUrl(),
      bannerImagePath: "/assets/hero-legacy.jpg",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
  }
}
