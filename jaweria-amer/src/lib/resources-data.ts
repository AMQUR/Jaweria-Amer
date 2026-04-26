import "server-only";

import type { CmsResourceRecord } from "@/lib/admin/cms-types";
import bundled from "./cms-resources-overrides.json";

/**
 * Bundled CMS resource overrides — shipped with the app so build and Vercel runtime
 * read the same data (no reliance on ephemeral `data/cms-resources.json` on disk).
 * For local admin edits, `data/cms-resources.json` is merged on top (see getStoredResourceOverrides).
 */
export const cmsResources: CmsResourceRecord[] = Array.isArray(bundled)
  ? (bundled as CmsResourceRecord[])
  : [];
