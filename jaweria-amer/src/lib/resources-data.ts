import "server-only";

import type { CmsResourceRecord } from "@/lib/admin/cms-types";
import cmsOverrides from "./cms-resources-overrides.json";

/**
 * Bundled CMS resource overrides — shipped with the app so build and Vercel runtime
 * read the same data (no reliance on ephemeral `data/cms-resources.json` on disk).
 */
export const cmsResources: CmsResourceRecord[] = Array.isArray(cmsOverrides)
  ? (cmsOverrides as CmsResourceRecord[])
  : [];

/** Returns bundled overrides only — no fs, safe on Vercel serverless. */
export function getStoredResourceOverrides(): CmsResourceRecord[] {
  const overrides = cmsResources;
  console.log("Overrides loaded:", overrides.length);
  return overrides;
}
