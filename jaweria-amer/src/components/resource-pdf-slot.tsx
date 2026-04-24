"use client";

import { SecurePdfRenderer } from "@/components/secure-pdf-renderer";

export function ResourcePdfSlot({ resourceId }: { resourceId: string }) {
  return <SecurePdfRenderer key={resourceId} resourceId={resourceId} />;
}
