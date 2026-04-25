"use client";

export default function PdfViewer({ src }: { src: string }) {
  return (
    <div>
      <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm" style={{ height: "calc(100vh - 120px)" }}>
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
