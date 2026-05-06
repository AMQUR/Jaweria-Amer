"use client";

type PdfViewerProps = {
  src: string;
};

export default function PdfViewer({ src }: PdfViewerProps) {
  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <iframe
        src={`${src}#toolbar=0&navpanes=0&scrollbar=1`}
        title="PDF viewer"
        className="h-full w-full"
        style={{ border: "none" }}
      />
    </div>
  );
}
