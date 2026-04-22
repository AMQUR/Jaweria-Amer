"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export function SecurePdfRenderer({ resourceId }: { resourceId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);

  const file = useMemo(
    () => `/api/view-resource?id=${encodeURIComponent(resourceId)}`,
    [resourceId]
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setWidth(Math.max(280, Math.floor(w - 8)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setLoadError(false);
  }, []);

  const onLoadError = useCallback(() => {
    setLoadError(true);
    setNumPages(null);
  }, []);

  if (loadError) {
    return (
      <div className="rounded-xl border border-border/80 bg-white p-8 text-center text-sm text-slate shadow-sm">
        Unable to display this resource right now.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[90vh] w-full overflow-y-auto rounded-xl border border-border/80 bg-neutral-100/80 py-4 shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">Loading…</div>
        }
        externalLinkTarget="_blank"
        externalLinkRel="noopener noreferrer nofollow"
      >
        {numPages !== null &&
          Array.from({ length: numPages }, (_, i) => (
            <div key={i + 1} className="mb-6 flex justify-center px-2 last:mb-0">
              <Page
                pageNumber={i + 1}
                width={width}
                renderTextLayer
                renderAnnotationLayer
                className="shadow-sm"
              />
            </div>
          ))}
      </Document>
    </div>
  );
}
