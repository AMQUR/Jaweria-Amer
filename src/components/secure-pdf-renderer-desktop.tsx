"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export type SecurePdfRendererLayout = "desktop" | "mobile";

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

export function SecurePdfRendererDesktop({
  resourceId,
  layout = "desktop",
}: {
  resourceId: string;
  layout?: SecurePdfRendererLayout;
}) {
  const isMobileLayout = layout === "mobile";
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
      const pad = isMobileLayout ? 12 : 8;
      setWidth(Math.max(260, Math.floor(w - pad)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobileLayout]);

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

  const navButtonClass = cn(
    "rounded-xl border border-border/80 bg-white font-semibold text-ink shadow-sm transition-colors touch-manipulation select-none",
    isMobileLayout
      ? "min-h-12 min-w-[5.5rem] px-4 py-3 text-base active:bg-muted disabled:opacity-40 disabled:active:bg-white"
      : "px-3 py-1.5 text-sm enabled:hover:bg-muted disabled:opacity-40"
  );

  const pageIndicatorClass = cn(
    "text-center font-medium tabular-nums text-slate",
    isMobileLayout ? "min-w-[7.5rem] flex-1 text-sm sm:text-base" : "min-w-[8rem] text-sm"
  );

  const controls = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 px-2",
        isMobileLayout &&
          "sticky bottom-0 z-20 shrink-0 border-t border-border/60 bg-neutral-100/95 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-neutral-100/85 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      )}
      role="toolbar"
      aria-label="PDF page navigation"
    >
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={numPages == null || currentPage <= 1}
        className={navButtonClass}
      >
        Previous
      </button>
      <span className={pageIndicatorClass} aria-live="polite">
        {numPages != null ? `Page ${currentPage} of ${numPages}` : "…"}
      </span>
      <button
        type="button"
        onClick={() => setPage((p) => (numPages != null ? Math.min(numPages, p + 1) : p + 1))}
        disabled={numPages == null || currentPage >= (numPages ?? 0)}
        className={navButtonClass}
      >
        Next
      </button>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full rounded-xl border border-border/80 bg-neutral-100/80 shadow-sm",
        isMobileLayout
          ? "flex max-h-[min(88vh,calc(100dvh-7rem))] flex-col overflow-hidden py-2"
          : "max-h-[90vh] overflow-y-auto py-4"
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!isMobileLayout && <div className="mb-4">{controls}</div>}
      <div
        className={cn(
          isMobileLayout &&
            "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] px-1"
        )}
      >
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={<PdfDocumentLoadingChrome />}
          externalLinkTarget="_blank"
          externalLinkRel="noopener noreferrer nofollow"
        >
          <div className={cn("flex justify-center", isMobileLayout ? "px-1 pb-3" : "px-2")}>
            <Page
              pageNumber={currentPage}
              width={width}
              renderTextLayer
              renderAnnotationLayer
              loading={<PdfPageLoadingChrome />}
              className="max-w-full shadow-sm"
            />
          </div>
        </Document>
      </div>
      {isMobileLayout && controls}
    </div>
  );
}
