import "server-only";

import { access } from "fs/promises";
import { join } from "path";
import { getCmsMcqSets, getCmsResources, getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
import { siteConfig, staticResources } from "@/lib/data";
import type { Resource } from "@/lib/data";
import { mcqSets as staticMcqSets } from "@/lib/mcq-data";
import type { McqSet } from "@/lib/mcq-data";

const PUBLIC_DIR = join(process.cwd(), "public");

function isValidResourceFileUrl(fileUrl: string | undefined): fileUrl is string {
  return typeof fileUrl === "string" && fileUrl.startsWith("/resources/");
}

async function publicFileExists(fileUrl: string) {
  try {
    await access(join(PUBLIC_DIR, fileUrl.replace(/^\//, "")));
    return true;
  } catch {
    return false;
  }
}

async function sanitizePublicResources(resources: Resource[]) {
  const sanitized = await Promise.all(
    (resources ?? []).map(async (resource) => {
      if (!resource) return null;
      if (resource.type === "mcq") return resource;
      if (!isValidResourceFileUrl(resource.fileUrl)) return null;
      if (!(await publicFileExists(resource.fileUrl))) {
        console.warn("Dropping missing resource file:", resource.id, resource.fileUrl);
        return null;
      }
      return resource;
    })
  );

  return sanitized.filter((resource): resource is Resource => Boolean(resource));
}

export async function getPublicResources(): Promise<Resource[]> {
  try {
    const cmsData = await getCmsResources();
    const cmsResources = cmsData?.filter((item) => !item.deleted && item.visibility === "published") ?? [];
    const resources = await sanitizePublicResources(
      cmsResources.map(
      (item) =>
        ({
          id: item.id,
          title: item.title,
          category: item.category,
          subCategory: item.subCategory,
          paper: item.paper,
          section: item.section,
          fileUrl: item.fileUrl,
          type: item.type === "mcq" ? "mcq" : undefined,
          subject: item.subject,
          level: item.level,
          year: item.year,
          description: item.description,
        }) satisfies Resource
      )
    );
    console.log("Resources count:", resources?.length ?? 0);
    return resources;
  } catch (error) {
    console.error("Falling back to static resources:", error);
    const resources = await sanitizePublicResources(staticResources);
    console.log("Resources count:", resources?.length ?? 0);
    return resources;
  }
}

export async function getPublicMcqSets(): Promise<Record<string, McqSet>> {
  try {
    const mcqs = await getCmsMcqSets();
    return Object.fromEntries(
      (mcqs ?? [])
        .filter((item) => !item.deleted && item.visibility === "published")
        .map((item) => [
          item.id,
          {
            id: item.id,
            title: item.title,
            description: item.description,
            timeLimit: item.timeLimit,
            questions: item.questions,
          } satisfies McqSet,
        ])
    );
  } catch (error) {
    console.error("Falling back to static MCQ sets:", error);
    return staticMcqSets;
  }
}

export async function getHomepageContent() {
  try {
    return await getStoredHomepageContent();
  } catch (error) {
    console.error("Falling back to default homepage content:", error);
    return {
      heroKicker: siteConfig.brandSubtitle,
      heroTitlePrimary: "Master CAIE English",
      heroTitleSecondary: "with Clarity and Care",
      heroDescription:
        "Rubric-driven instruction, calm accountability, and mentorship that builds independent thinkers. Structured practice that holds up on exam day.",
      primaryCtaText: "Book a Clarity Call",
      primaryCtaLink: "/contact/whatsapp-primary",
      secondaryCtaText: "Join WhatsApp group",
      secondaryCtaLink: "/contact/whatsapp-group",
      bannerImagePath: "/images/homepage-banner.png",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
  }
}
