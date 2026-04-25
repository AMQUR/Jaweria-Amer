import "server-only";

import { access } from "fs/promises";
import { join } from "path";
import { getCmsMcqSets, getCmsResources, getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
import { siteConfig, staticResources } from "@/lib/data";
import type { Resource } from "@/lib/data";
import { normalizeTopicalsResource } from "@/lib/resource-ingestion";
import { mcqSets as staticMcqSets } from "@/lib/mcq-data";
import type { McqSet } from "@/lib/mcq-data";

const PUBLIC_DIR = join(process.cwd(), "public");

function isValidResourceFileUrl(fileUrl: string | undefined): fileUrl is string {
  return typeof fileUrl === "string" && fileUrl.startsWith("/resources/");
}

async function publicFileExists(fileUrl: string) {
  const pathOnly = fileUrl.split("?")[0]?.split("#")[0] ?? fileUrl;
  try {
    await access(join(PUBLIC_DIR, pathOnly.replace(/^\//, "")));
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

function withStrictTopicals(resources: Resource[]): Resource[] {
  return resources.map((r) => normalizeTopicalsResource(r));
}

/** Curated static catalog — same source as pre-CMS `staticResources` in @/lib/data. */
function getStaticResources(): Resource[] {
  return staticResources;
}

async function getSanitizedOrRawStatic(): Promise<Resource[]> {
  const base = getStaticResources();
  const sanitized = await sanitizePublicResources(base);
  if (sanitized.length > 0) {
    return sanitized;
  }
  // Never return [] — always serve raw static as last resort
  console.warn("public-cms: sanitized static was empty; using raw static resource list for public display");
  return base;
}

export async function getPublicResources(): Promise<Resource[]> {
  const rawStatic = getStaticResources();

  try {
    const cmsData = await getCmsResources();
    const cmsResources = cmsData?.filter((item) => !item.deleted && item.visibility === "published") ?? [];
    const fromCms = await sanitizePublicResources(
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

    const staticRes = await getSanitizedOrRawStatic();
    const byId = new Map<string, Resource>();
    for (const r of staticRes) {
      if (r?.id) byId.set(r.id, r);
    }
    if (Array.isArray(fromCms) && fromCms.length > 0) {
      for (const r of fromCms) {
        if (r?.id) byId.set(r.id, r);
      }
    } else {
      console.error("CMS public list empty after sanitize, using static fallback");
    }
    const merged = Array.from(byId.values());
    // Prefer CMS-backed list when non-empty; otherwise static so the hub never goes empty
    const out = merged.length > 0 ? merged : rawStatic;
    return withStrictTopicals(out.length > 0 ? out : rawStatic);
  } catch (error) {
    console.error("CMS failed, using static fallback", error);
    const fallback = await getSanitizedOrRawStatic();
    return withStrictTopicals(fallback.length > 0 ? fallback : rawStatic);
  }
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
      bannerImagePath: "/assets/hero-premium.png",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
  }
}
