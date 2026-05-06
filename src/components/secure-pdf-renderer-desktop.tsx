"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function PdfDocumentLoadingChrome() {
  return (
    <div className="flex flex-col gap-4 px-2 py-2">
      <div className="flex justify-center gap-2 opacity-70">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/70" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/70" />
      </div>
      <div className="flex justify-center">
        <div className="h-[72vh] w-full max-w-[760px] animate-pulse rounded-lg bg-gradient-to-b from-white via-muted/30 to-muted/50 shadow-inner ring-1 ring-border/40" />
      </div>
      <p className="text-center text-xs text-muted-foreground">Opening resource…</p>
    </div>
  );
}

function PdfPageLoadingChrome() {
  return (
    <div className="flex min-h-[62vh] w-full max-w-[760px] items-start justify-center rounded-lg bg-white/95 pb-12 pt-10 shadow-inner ring-1 ring-border/40">
      <div className="w-[92%] max-w-xl space-y-3 pt-4">
        <div className="h-3 w-5/6 max-w-md animate-pulse rounded bg-muted/65" />
        <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
        <div className="h-3 w-[93%] animate-pulse rounded bg-muted/45" />
        <div className="h-3 w-[88%] animate-pulse rounded bg-muted/55" />
        <div className="pt-8">
          <div className="h-48 w-full animate-pulse rounded-md bg-muted/35" />
        </div>
      </div>
    </div>
  );
}

export function SecurePdfRendererDesktop({ resourceId }: { resourceId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const file = useMemo(
    () => `/api/view-resource?id=${encodeURIComponent(resourceId)}`,
    [resourceId]
  );

  const currentPage = numPages == null ? 1 : Math.min(Math.max(1, page), numPages);

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
    try {
      setNumPages(n);
      setPage(1);
      setLoadError(null);
    } catch {
      setLoadError("The resource opened, but the PDF viewer could not render it.");
    }
  }, []);

  const onLoadError = useCallback(() => {
    fetch(`/api/view-resource?id=${encodeURIComponent(resourceId)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.ok) {
          setLoadError("The resource loaded, but the browser PDF viewer could not render it.");
          return;
        }
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setLoadError(payload?.error ?? "The resource could not be loaded.");
      })
      .catch(() => setLoadError("The resource could not be loaded. Please try again."));
    setNumPages(null);
  }, [resourceId]);

  if (loadError) {
    return (
      <div className="rounded-xl border border-border/80 bg-white p-8 text-center text-sm text-slate shadow-sm">
        {loadError}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[90vh] w-full overflow-y-auto rounded-xl border border-border/80 bg-neutral-100/80 py-4 shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 px-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={numPages == null || currentPage <= 1}
          className="rounded-lg border border-border/80 bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition-colors enabled:hover:bg-muted disabled:opacity-40"
        >
          Previous
        </button>
        <span className="min-w-[8rem] text-center text-sm text-slate" aria-live="polite">
          {numPages != null ? `Page ${currentPage} of ${numPages}` : "…"}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => (numPages != null ? Math.min(numPages, p + 1) : p + 1))}
          disabled={numPages == null || currentPage >= (numPages ?? 0)}
          className="rounded-lg border border-border/80 bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition-colors enabled:hover:bg-muted disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={<PdfDocumentLoadingChrome />}
        externalLinkTarget="_blank"
        externalLinkRel="noopener noreferrer nofollow"
      >
        <div className="flex justify-center px-2">
          <Page
            pageNumber={currentPage}
            width={width}
            renderTextLayer
            renderAnnotationLayer
            loading={<PdfPageLoadingChrome />}
            className="shadow-sm"
          />
        </div>
      </Document>
    </div>
  );
}
