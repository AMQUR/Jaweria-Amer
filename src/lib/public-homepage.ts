import "server-only";

import { getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
import { defaultHomepageContent } from "@/lib/admin/defaults";
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
    return { ...defaultHomepageContent };
  }
}
