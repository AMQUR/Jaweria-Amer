import { contact } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

/** Minimal JSON-LD for Organization + WebSite (no PII beyond public contact). */
export function StructuredData() {
  const origin = getSiteUrl().href.replace(/\/$/, "");
  const sameAs = [contact.youtube, contact.instagram, contact.facebook?.trim()].filter(
    (u): u is string => Boolean(u && u.length > 0)
  );

  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        name: siteConfig.name,
        description: siteConfig.description,
        url: origin,
        email: contact.email,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: origin,
        description: siteConfig.description,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
