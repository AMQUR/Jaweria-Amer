import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ResourceViewTracker } from "@/components/analytics/resource-view-tracker";
import { McqViewer } from "@/components/mcq-viewer";
import { ResourcePdfSlot } from "@/components/resource-pdf-slot";
import { getPublicMcqSets, getPublicResources } from "@/lib/public-cms";
import { formatDisplayTitle } from "@/lib/resource-ingestion";

type Params = Promise<{ id: string }>;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const resources = (await getPublicResources()) ?? [];
  const resource = (resources ?? []).find((r) => r?.id === id);
  if (!resource) return { title: "Resource" };
  const path = `/resources/view/${resource.id}`;
  const displayTitle = formatDisplayTitle(resource.title, resource.category);
  return {
    title: `${displayTitle} | Resources`,
    description: resource.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${displayTitle} | Resources`,
      description: resource.description,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayTitle} | Resources`,
      description: resource.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ResourceViewPage({ params }: { params: Params }) {
  const { id } = await params;
  const [resources, mcqSets] = await Promise.all([getPublicResources(), getPublicMcqSets()]);
  const safeResources = (resources ?? []).filter(
    (resource) =>
      Boolean(resource) &&
      (resource.type === "mcq" ||
        (typeof resource.fileUrl === "string" &&
          (resource.fileUrl.startsWith("/resources/") || resource.fileUrl.startsWith("http"))))
  );
  const resource = safeResources.find((r) => r.id === id);
  if (!resource) notFound();

  const displayTitle = formatDisplayTitle(resource.title, resource.category);
  const meta = [resource.level, resource.subject, resource.year, resource.paper].join(" · ");

  const isMcq = resource.type === "mcq";
  const mcq = isMcq ? (mcqSets?.[resource.id] ?? null) : null;
  if (isMcq && !mcq) {
    console.error("Missing MCQ set:", resource.id);
  }
  if (!isMcq && !resource?.fileUrl) {
    return (
      <div className="min-h-screen bg-cream">
        <ResourceViewTracker id={resource.id} title={displayTitle} />
        <section className="border-b border-border/70 bg-crimson pb-8 pt-24 text-white sm:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/resources"
              className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-rose"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to resources
            </Link>
            <h1 className="font-serif text-2xl font-bold leading-snug sm:text-3xl">{displayTitle}</h1>
          </div>
        </section>
        <div className="p-6 text-center">
          <p>File not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <ResourceViewTracker id={resource.id} title={displayTitle} />

      {/* Page header */}
      <section className="border-b border-border/70 bg-crimson pb-8 pt-24 text-white sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/resources"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-rose"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to resources
          </Link>
          <h1 className="font-serif text-2xl font-bold leading-snug sm:text-3xl">{displayTitle}</h1>
          <p className="mt-2 text-sm text-white/60">{meta}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">{resource.description}</p>
          {isMcq && mcq && (
            <p className="mt-3 text-sm font-medium text-white/80">
              {mcq.questions.length} questions
              {mcq.timeLimit
                ? ` · ${mcq.timeLimit / 60} minutes`
                : " · 3 sections"}
              {" · instant scoring"}
            </p>
          )}
        </div>
      </section>

      {/* Body */}
      <div className={isMcq ? "py-10 sm:py-14" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}>
        {isMcq && mcq ? (
          <McqViewer mcqSet={mcq} />
        ) : isMcq && !mcq ? (
          <div className="p-6 text-center">
            <h2 className="text-lg font-semibold">Assessment data not found</h2>
            <p className="text-sm text-muted-foreground">
              This assessment is not properly configured.
            </p>
          </div>
        ) : (
          <ResourcePdfSlot resourceId={resource.id} fileUrl={resource.fileUrl} />
        )}
      </div>
    </div>
  );
}
