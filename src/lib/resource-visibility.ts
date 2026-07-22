import type { Resource } from "@/lib/data";

/**
 * Single source of truth for student-facing resource visibility.
 *
 * Directed Writing is the only educational area withheld from students. The data,
 * files, and Supabase objects stay untouched — admin surfaces keep reading
 * `staticResources`, while every student-facing surface reads the filtered
 * `resources` export (see `src/lib/data.ts`), which applies the rules below.
 */

/** Lowercase, strip punctuation/underscores/hyphens, collapse whitespace. */
function normalizeVisibilityLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Matches "Directed Writing" and its slug/spacing/plural variants
 * (`directed-writing`, `directed_writing`, `DIRECTED  WRITING`, `directed writings`).
 * Deliberately narrow: a bare "writing" (Essay Writing, Summary Writing) never matches.
 */
export function isDirectedWritingLabel(value: string | null | undefined): boolean {
  if (!value) return false;
  return /\bdirected writings?\b/.test(normalizeVisibilityLabel(value));
}

/**
 * Fields used for classification. `description` is intentionally excluded — several
 * legitimate vocabulary/essay resources merely mention directed writing in prose.
 */
function directedWritingSignals(
  resource: Pick<Resource, "id" | "title" | "category" | "subCategory" | "section" | "fileUrl">
): (string | undefined)[] {
  return [resource.id, resource.title, resource.category, resource.subCategory, resource.section, resource.fileUrl];
}

/** True when the resource is classified as Directed Writing by id, title, category, subcategory, section, or file path. */
export function isDirectedWritingResource(
  resource: Pick<Resource, "id" | "title" | "category" | "subCategory" | "section" | "fileUrl">
): boolean {
  return directedWritingSignals(resource).some(isDirectedWritingLabel);
}

/** Drops Directed Writing items from any student-facing list. */
export function withoutDirectedWriting<T extends Pick<Resource, "id" | "title" | "category" | "subCategory" | "section" | "fileUrl">>(
  resources: readonly T[]
): T[] {
  return resources.filter((resource) => !isDirectedWritingResource(resource));
}

/** Drops Directed Writing entries from navigation lists (topic tiles, section labels, filter options). */
export function withoutDirectedWritingLabels<T extends string | { id?: string; value?: string; label?: string }>(
  entries: readonly T[]
): T[] {
  return entries.filter((entry) => {
    if (typeof entry === "string") return !isDirectedWritingLabel(entry);
    return !isDirectedWritingLabel(entry.id) && !isDirectedWritingLabel(entry.value) && !isDirectedWritingLabel(entry.label);
  });
}
