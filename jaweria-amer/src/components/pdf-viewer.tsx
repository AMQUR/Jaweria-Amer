"use client";

import { useEffect, useState } from "react";

export default function PdfViewer({ src }: { src: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- UA + viewport only available in browser
    setIsMobile(
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768
    );
  }, []);

  if (isMobile) {
    return (
      <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Open this resource to view all pages
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Mobile browsers may only show the first page inside an embedded
          viewer. Open the PDF directly to scroll, zoom, download, or print
          the full document.
        </p>
        <div className="mt-5 grid gap-3">
          <button
            onClick={() => { window.location.href = src; }}
            className="w-full rounded-full bg-[#ea580c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c2410c] active:scale-95"
          >
            Open Full PDF
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full border border-border/80 px-5 py-3 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Open in New Tab
          </a>
          <a
            href={src}
            download
            className="w-full rounded-full border border-border/80 px-5 py-3 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="w-full overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <iframe
          src={src}
          title="PDF viewer"
          className="h-full w-full"
          style={{ border: "none" }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={src}
          download
          className="inline-flex items-center gap-2 rounded-full bg-[#ea580c] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#c2410c]"
        >
          Download
        </a>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-5 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}
