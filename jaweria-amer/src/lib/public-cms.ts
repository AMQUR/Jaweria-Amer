import "server-only";

import { access } from "fs/promises";
import { join } from "path";
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

const PUBLIC_DIR = join(process.cwd(), "public");

/** Map stored paths to the public URL shape `/resources/...` (files live under `public/resources/`). */
function normalizePublicResourceFileUrl(fileUrl: string | undefined): string | undefined {
  if (typeof fileUrl !== "string") return undefined;
  let u = fileUrl.trim();
  if (!u) return undefined;
  u = u.split("?")[0]?.split("#")[0] ?? u;
  try {
    if (u.startsWith("http://") || u.startsWith("https://")) {
      u = new URL(u).pathname;
    }
  } catch {
    return undefined;
  }
  if (u.startsWith("/public/resources/")) {
    u = u.slice("/public".length);
  } else if (u.toLowerCase().startsWith("public/resources/")) {
    u = `/${u.slice("public/".length)}`;
  }
  if (!u.startsWith("/") && u.toLowerCase().startsWith("resources/")) {
    u = `/${u}`;
  }
  if (u.includes("..")) return undefined;
  return u || undefined;
}

function isSafeResourcesPath(fileUrl: string): boolean {
  return fileUrl.startsWith("/resources/") && !fileUrl.includes("..");
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
      const normalized = normalizePublicResourceFileUrl(resource.fileUrl);
      if (!normalized || !isSafeResourcesPath(normalized)) return null;
      if (!(await publicFileExists(normalized))) {
        console.warn("Resource file not found on server (keeping CMS entry):", resource.id, normalized);
      }
      return normalized === resource.fileUrl ? resource : { ...resource, fileUrl: normalized };
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
    console.log("CMS resources:", cmsResources.length);

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

    console.log("CMS resources after sanitize:", fromCms.length);
    return withStrictTopicals(fromCms);
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
