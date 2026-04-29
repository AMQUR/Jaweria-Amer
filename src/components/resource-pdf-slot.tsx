"use client";

import PdfViewer from "@/components/pdf-viewer";

export function ResourcePdfSlot({
  fileUrl,
}: {
  resourceId: string;
  fileUrl: string;
}) {
  return <PdfViewer src={fileUrl} />;
}
