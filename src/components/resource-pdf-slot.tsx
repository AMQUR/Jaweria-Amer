"use client";

import Image from "next/image";
import { SecurePdfRenderer } from "@/components/secure-pdf-renderer";

function extensionFrom(fileUrl: string) {
  try {
    const pathname = fileUrl.startsWith("http") ? new URL(fileUrl).pathname : fileUrl;
    return pathname.split("?")[0]?.split("#")[0]?.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

export function ResourcePdfSlot({
  resourceId,
  fileUrl,
}: {
  resourceId: string;
  fileUrl: string;
}) {
  const src = `/api/view-resource?id=${encodeURIComponent(resourceId)}`;
  const extension = extensionFrom(fileUrl);
  const isPdf = extension === "pdf" || !extension;
  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(extension);
  const isTextLike = ["txt", "csv", "json"].includes(extension);

  if (isPdf) {
    return <SecurePdfRenderer resourceId={resourceId} fileUrl={fileUrl} />;
  }

  if (isImage) {
    return (
      <div className="flex max-h-[85vh] justify-center overflow-auto rounded-xl border border-border/80 bg-neutral-50 p-4 shadow-sm">
        <Image
          src={src}
          alt="Resource preview"
          width={1600}
          height={1200}
          unoptimized
          className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>
    );
  }

  if (isTextLike) {
    return (
      <iframe
        title="Resource preview"
        src={src}
        className="h-[85vh] w-full rounded-xl border border-border/80 bg-white shadow-sm"
      />
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-white p-8 text-center text-sm text-slate shadow-sm">
      This file can be viewed by request, but a browser preview is not available for this file type.
    </div>
  );
}
