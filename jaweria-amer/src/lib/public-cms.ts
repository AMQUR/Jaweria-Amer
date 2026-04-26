import "server-only";

import { getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
import { siteConfig, staticResources } from "@/lib/data";
import type { Resource } from "@/lib/data";
import { normalizeTopicalsResource } from "@/lib/resource-ingestion";
import { mcqSets as staticMcqSets } from "@/lib/mcq-data";
import type { McqSet } from "@/lib/mcq-data";
import { getWhatsAppUrl, isInvalidWhatsAppLink } from "@/lib/contact";

function sanitizeCtaLink(link: string | undefined): string {
  if (!link || isInvalidWhatsAppLink(link)) {
    if (typeof window !== "undefined") {
      console.warn("Blocked invalid WhatsApp link:", link);
    }
    return getWhatsAppUrl();
  }
  return link;
}

function withStrictTopicals(resources: Resource[]): Resource[] {
  return resources.map((r) => normalizeTopicalsResource(r));
}

/** Public resources: static catalog only (no CMS / no async). */
export function getPublicResources(): Resource[] {
  return withStrictTopicals(staticResources);
}

/** Public MCQ sets: bundled static data only (no CMS). */
export function getPublicMcqSets(): Record<string, McqSet> {
  return staticMcqSets;
}

export async function getHomepageContent() {
  try {
    const stored = await getStoredHomepageContent();
    return {
      ...stored,
      primaryCtaLink: sanitizeCtaLink(stored.primaryCtaLink),
      secondaryCtaLink: sanitizeCtaLink(stored.secondaryCtaLink),
    };
  } catch (error) {
    console.error("Falling back to default homepage content:", error);
    return {
      heroKicker: siteConfig.brandSubtitle,
      heroTitlePrimary: "Master CAIE English",
      heroTitleSecondary: "with Clarity and Care",
      heroDescription:
        "Rubric-driven instruction, calm accountability, and mentorship that builds independent thinkers. Structured practice that holds up on exam day.",
      primaryCtaText: "Join WhatsApp Community",
      primaryCtaLink: getWhatsAppUrl(),
      secondaryCtaText: "Join WhatsApp Community",
      secondaryCtaLink: getWhatsAppUrl(),
      bannerImagePath: "/assets/hero-legacy.jpg",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
  }
}
