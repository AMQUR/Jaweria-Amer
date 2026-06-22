import "server-only";

import { resources as publicResources } from "@/lib/data";
import type { Resource } from "@/lib/data";
import { normalizeTopicalsResource } from "@/lib/resource-ingestion";
import { mcqSets as staticMcqSets } from "@/lib/mcq-data";
import type { McqSet } from "@/lib/mcq-data";

function withStrictTopicals(resources: Resource[]): Resource[] {
  return resources.map((r) => normalizeTopicalsResource(r));
}

export function getPublicResources(): Resource[] {
  // Use the filtered `resources` export: it drops MISSING_PUBLIC_RESOURCE_URLS
  // (note PDFs whose local files are not hosted) so unhidden categories like
  // Notes never render cards that 404. Replace those URLs with Supabase links
  // to bring the items back.
  return withStrictTopicals(publicResources);
}

export function getPublicMcqSets(): Record<string, McqSet> {
  return staticMcqSets;
}
