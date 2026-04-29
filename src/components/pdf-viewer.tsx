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
        <h2 className="text-lg font-semibold text-gray-900">View Full Document</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Tap below to open the full PDF. You can scroll, zoom, and save it directly from your device.
        </p>
        <div className="mt-5">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-[#ea580c] py-3 text-center font-medium text-white transition hover:bg-[#c2410c] active:scale-95"
          >
            Open PDF
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
