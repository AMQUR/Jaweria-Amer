import "server-only";

import { getCmsMcqSets, getCmsResources, getHomepageContent as getStoredHomepageContent } from "@/lib/admin/cms-store";
import type { Resource } from "@/lib/data";
import type { McqSet } from "@/lib/mcq-data";

export async function getPublicResources(): Promise<Resource[]> {
  const resources = await getCmsResources();
  return resources
    .filter((item) => !item.deleted && item.visibility === "published")
    .filter((item) => item.type === "mcq" || item.fileUrl)
    .map(
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
    );
}

export async function getPublicMcqSets(): Promise<Record<string, McqSet>> {
  const mcqs = await getCmsMcqSets();
  return Object.fromEntries(
    mcqs
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
}

export async function getHomepageContent() {
  return getStoredHomepageContent();
}
