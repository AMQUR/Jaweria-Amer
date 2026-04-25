"use client";

import PdfViewer from "@/components/pdf-viewer";

export function ResourcePdfSlot({
  resourceId: _resourceId,
  fileUrl,
}: {
  resourceId: string;
  fileUrl: string;
}) {
  return <PdfViewer src={fileUrl} />;
}
