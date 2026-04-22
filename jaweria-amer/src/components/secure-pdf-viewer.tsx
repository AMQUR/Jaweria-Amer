"use client";

import { useEffect } from "react";

/**
 * Streams PDF via `/api/view-resource` and applies light client-side friction
 * (context menu, common save/print shortcuts). Not a cryptographic control.
 */
export function SecurePdfViewer({ resourceId, title }: { resourceId: string; title: string }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const src = `/api/view-resource?id=${encodeURIComponent(resourceId)}`;

  return (
    <div className="relative h-[90vh] w-full" onContextMenu={(e) => e.preventDefault()}>
      <iframe
        title={title}
        src={src}
        className="h-full w-full rounded-xl border border-border/80 bg-white shadow-sm"
        allow="fullscreen"
      />
      {/* pointer-events-none so the PDF remains scrollable; still blocks nothing inside the iframe */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden />
    </div>
  );
}
