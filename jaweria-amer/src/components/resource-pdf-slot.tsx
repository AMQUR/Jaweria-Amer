"use client";

import { SecurePdfRenderer } from "@/components/secure-pdf-renderer";

export function ResourcePdfSlot({
  resourceId,
  fileUrl,
}: {
  resourceId: string;
  fileUrl: string;
}) {
  return <SecurePdfRenderer key={resourceId} resourceId={resourceId} fileUrl={fileUrl} />;
}
