import "server-only";

import { staticResources } from "@/lib/data";
import type { Resource } from "@/lib/data";
import { normalizeTopicalsResource } from "@/lib/resource-ingestion";
import { mcqSets as staticMcqSets } from "@/lib/mcq-data";
import type { McqSet } from "@/lib/mcq-data";

function withStrictTopicals(resources: Resource[]): Resource[] {
  return resources.map((r) => normalizeTopicalsResource(r));
}

export function getPublicResources(): Resource[] {
  return withStrictTopicals(staticResources);
}

export function getPublicMcqSets(): Record<string, McqSet> {
  return staticMcqSets;
}
