"use client";

import dynamic from "next/dynamic";

const SecurePdfRenderer = dynamic(
  () => import("@/components/secure-pdf-renderer").then((m) => ({ default: m.SecurePdfRenderer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-border/80 bg-white text-sm text-muted-foreground shadow-sm">
        Loading…
      </div>
    ),
  }
);

export function ResourcePdfSlot({ resourceId }: { resourceId: string }) {
  return <SecurePdfRenderer key={resourceId} resourceId={resourceId} />;
}
