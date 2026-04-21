import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ResourceViewTracker } from "@/components/analytics/resource-view-tracker";
import { resources } from "@/lib/data";
import { formatDisplayTitle } from "@/lib/resource-ingestion";
import { publicFileAbsoluteUrl } from "@/lib/public-asset-url";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return resources.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const resource = resources.find((r) => r.id === id);
  if (!resource) return { title: "Resource" };
  const path = `/resources/view/${resource.id}`;
  const displayTitle = formatDisplayTitle(resource.title);
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
  const resource = resources.find((r) => r.id === id);
  if (!resource) notFound();

  const displayTitle = formatDisplayTitle(resource.title);
  const absolutePdfUrl = await publicFileAbsoluteUrl(resource.fileUrl);
  const gviewSrc = `https://docs.google.com/gview?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`;

  const meta = [resource.level, resource.subject, resource.year, resource.paper].join(" · ");

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
          <p className="mt-2 text-sm text-white/60">{meta}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">{resource.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <iframe
          title={displayTitle}
          src={gviewSrc}
          className="w-full h-[80vh] rounded-xl border border-border/80 bg-white shadow-sm"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
