import "server-only";

import { getCmsMcqSets, getCmsResources, getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
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

/**
 * Map CMS file URLs to public paths under `/resources/...` (files live in `public/resources/` on disk).
 * No filesystem access — safe on Vercel serverless.
 */
function normalizePublicResourceFileUrl(url: string | null | undefined): string | null {
  if (url == null) return null;

  let clean = String(url).trim();
  if (!clean) return null;
  clean = clean.split("?")[0]?.split("#")[0] ?? clean;

  clean = clean.replace(/^https?:\/\/[^/]+/i, "");

  clean = clean.replace(/^\/?public\//, "/");

  if (!clean.startsWith("/")) {
    clean = `/${clean}`;
  }

  if (!clean.startsWith("/resources/")) {
    return null;
  }

  return clean;
}

function sanitizePublicResources(resources: Resource[]): Resource[] {
  return (resources ?? [])
    .filter((r) => r && String(r.title ?? "").trim())
    .map((r) => {
      if (r.type === "mcq") return { ...r };
      const normalized = normalizePublicResourceFileUrl(r.fileUrl);
      const fileUrl = (normalized ?? String(r.fileUrl ?? "").trim()) as string;
      return { ...r, fileUrl };
    });
}

function withStrictTopicals(resources: Resource[]): Resource[] {
  return resources.map((r) => normalizeTopicalsResource(r));
}

export async function getPublicResources(): Promise<Resource[]> {
  const cmsData = await getCmsResources();
  const cmsResources = cmsData?.filter((item) => !item.deleted && item.visibility === "published") ?? [];
  console.log("CMS raw:", cmsResources.length);

  const fromCms = sanitizePublicResources(
    cmsResources.map(
      (item) =>
        ({
          id: item.id,
          title: item.title,
          category: item.category,
          subCategory: item.subCategory,
          paper: item.paper,
          section: item.section,
          fileUrl: item.fileUrl ?? "",
          type: item.type === "mcq" ? "mcq" : undefined,
          subject: item.subject,
          level: item.level,
          year: item.year,
          description: item.description,
        }) satisfies Resource
    )
  );

  console.log("CMS after sanitize:", fromCms.length);
  return withStrictTopicals(fromCms);
}

export async function getPublicMcqSets(): Promise<Record<string, McqSet>> {
  try {
    const mcqs = await getCmsMcqSets();
    const published = (mcqs ?? []).filter((item) => !item.deleted && item.visibility === "published");
    const fromCms = Object.fromEntries(
      published.map((item) => {
        const staticBase = staticMcqSets[item.id];
        const questions =
          Array.isArray(item.questions) && item.questions.length > 0
            ? item.questions
            : (staticBase?.questions ?? []);
        return [
          item.id,
          {
            id: item.id,
            title: item.title,
            description: item.description,
            timeLimit: item.timeLimit ?? staticBase?.timeLimit,
            questions,
          } satisfies McqSet,
        ];
      })
    );
    return { ...staticMcqSets, ...fromCms };
  } catch (error) {
    console.error("Falling back to static MCQ sets:", error);
    return staticMcqSets;
  }
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
