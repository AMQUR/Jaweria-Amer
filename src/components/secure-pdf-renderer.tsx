"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useState } from "react";

/**
 * All PDF pages load through the secure proxy path `/api/view-resource?id=` (see SecurePdfRendererDesktop).
 * Raw storage URLs must never be passed to the renderer.
 */

function PdfSkeleton() {
  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-border/80 bg-neutral-100/80 shadow-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading resource viewer"
    >
      <div className="pointer-events-none space-y-3 p-6">
        <div className="h-3 w-40 animate-pulse rounded bg-muted/55" />
        <div className="h-[90vh] min-h-[320px] animate-pulse rounded-lg bg-gradient-to-b from-muted/45 via-muted/25 to-muted/35 ring-1 ring-border/30" />
        <p className="text-center text-xs text-muted-foreground">Preparing viewer…</p>
      </div>
    </div>
  );
}

const SecurePdfRendererDesktop = dynamic(
  () =>
    import("@/components/secure-pdf-renderer-desktop").then((m) => ({
      default: m.SecurePdfRendererDesktop,
    })),
  {
    ssr: false,
    loading: () => <PdfSkeleton />,
  }
);

export function SecurePdfRenderer({
  resourceId,
}: {
  resourceId: string;
  fileUrl: string;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- UA is only available in the browser
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  if (!resourceId) {
    return null;
  }

  if (isMobile === null) {
    return <PdfSkeleton />;
  }

  return (
    <SecurePdfRendererDesktop resourceId={resourceId} layout={isMobile ? "mobile" : "desktop"} />
  );
}
