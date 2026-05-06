"use client";

/** Tracks warmed IDs only — avoids hammering the proxy with duplicate HEAD/RANGE probes. */
const warmedPdfPrefixes = new Set<string>();

/**
 * Warms the secure `/api/view-resource` tunnel with a small ranged GET (same-origin only).
 * Does not expose storage URLs in the client bundle.
 */
export function prefetchViewResource(resourceId: string): void {
  if (!resourceId || warmedPdfPrefixes.has(resourceId)) return;
  warmedPdfPrefixes.add(resourceId);
  const qs = `id=${encodeURIComponent(resourceId)}`;
  void fetch(`/api/view-resource?${qs}`, {
    method: "GET",
    headers: { Range: "bytes=0-65535", Accept: "application/pdf,*/*" },
  }).catch(() => warmedPdfPrefixes.delete(resourceId));
}

/** Warm react-pdf desktop chunk after idle — avoids spinner overlap with dynamic import. */
export function preloadSecurePdfDesktopChunk(): void {
  const run = () => void import("@/components/secure-pdf-renderer-desktop");
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 1500 });
    return;
  }
  void Promise.resolve().then(run);
}
