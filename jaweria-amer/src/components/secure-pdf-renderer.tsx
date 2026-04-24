"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useState } from "react";

function PdfSkeleton() {
  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-border/80 bg-neutral-100/80 shadow-sm"
      aria-hidden
    >
      <div className="h-[90vh] min-h-[320px] animate-pulse bg-gradient-to-b from-muted/40 to-muted/20" />
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

export function SecurePdfRenderer({ resourceId }: { resourceId: string }) {
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

  if (isMobile) {
    return (
      <div className="w-full">
        <iframe
          title="Resource preview"
          src={`/api/view-resource?id=${encodeURIComponent(resourceId)}`}
          className="h-[90vh] w-full rounded-xl border"
        />
      </div>
    );
  }

  return <SecurePdfRendererDesktop resourceId={resourceId} />;
}
