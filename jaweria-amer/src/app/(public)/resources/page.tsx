import type { Metadata } from "next";
import { ExternalLink, FolderOpen, PlayCircle } from "lucide-react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { ResourcesHub } from "@/components/resources-hub";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free vault: notes, topicals, yearlies, scripts, marking schemes, and MCQ drills for Cambridge O Level English (1123).",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: `Resources | ${siteConfig.name}`,
    description:
      "Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised for purposeful practice.",
    type: "website",
    url: "/resources",
  },
  twitter: {
    card: "summary_large_image",
    title: `Resources | ${siteConfig.name}`,
    description:
      "Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised for purposeful practice.",
  },
};

export default function ResourcesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-crimson to-crimson-dark pb-16 pt-28 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs">
            Learning hub
          </p>
          <h1 className="mb-4 max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
            Resources
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">
            Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised so you can
            practise with a clear path instead of a file dump.
          </p>
        </div>
      </section>

      <div
        className="pointer-events-none h-12 w-full bg-white sm:h-14"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(198, 40, 57, 0.05), transparent)",
        }}
        aria-hidden
      />

      <section className="border-b border-border/70 bg-white pb-12 pt-8 sm:pb-14 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
            <div
              className="flex flex-col justify-center rounded-2xl border border-[rgba(198,40,57,0.08)] bg-white p-8 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-crimson text-white">
                <PlayCircle className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand">Channel</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-crimson sm:text-3xl">
                English with Jaweria on YouTube
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">
                Lesson-style explanations, exam thinking, and revision support — built to complement
                the materials below.
              </p>
              <TrackedOutboundLink
                href={contact.youtube}
                channel="youtube"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-crimson px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose"
              >
                Open YouTube channel
                <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
              </TrackedOutboundLink>
            </div>

            <div
              className="flex flex-col justify-between rounded-2xl border border-white/15 p-8 text-white shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(198, 40, 57, 0.92), rgba(233, 30, 99, 0.80))",
              }}
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                  <FolderOpen className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">Full vault</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">Full Resource Pack</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90">
                  The curated folder bundles extended handouts and session materials in one place —
                  for students who want the complete archive alongside this hub.
                </p>
              </div>
              <TrackedOutboundLink
                href={contact.drive}
                channel="drive"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl border border-white/25 bg-white/95 px-5 py-3 text-sm font-semibold text-crimson shadow-sm transition-[background-color,color,box-shadow] duration-200 hover:border-white/40 hover:bg-white hover:shadow-md"
              >
                Open full pack
                <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
              </TrackedOutboundLink>
            </div>
          </div>
        </div>
      </section>

      <ResourcesHub />
    </>
  );
}
