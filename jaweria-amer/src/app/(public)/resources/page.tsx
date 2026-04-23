import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FolderOpen, PlayCircle, CalendarDays } from "lucide-react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact } from "@/lib/contact";
import { siteConfig, staticResources } from "@/lib/data";
import { getPublicResources } from "@/lib/public-cms";
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

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = (await getPublicResources()) ?? [];
  const safeResources =
    Array.isArray(resources) && resources.length > 0 ? resources : staticResources;

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
              className="flex flex-col justify-center rounded-2xl border border-[#fda4af] bg-gradient-to-br from-[#fff1f2] via-white to-[#ffe4e6] p-8 shadow-[0_10px_30px_rgba(244,63,94,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(244,63,94,0.25)] sm:p-10"
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
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#be123c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9f1239]"
              >
                Open YouTube channel
                <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
              </TrackedOutboundLink>
            </div>

            <div
              className="flex flex-col justify-between rounded-2xl border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c] p-8 text-white shadow-[0_12px_35px_rgba(127,29,29,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(127,29,29,0.45)] sm:p-10"
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                  <FolderOpen className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Full vault</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">Full Resource Pack</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                  The curated folder bundles extended handouts and session materials in one place —
                  for students who want the complete archive alongside this hub.
                </p>
              </div>
              <TrackedOutboundLink
                href={contact.drive}
                channel="drive"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-[#7f1d1d] shadow-sm transition-all duration-300 hover:bg-[#ffe4e6]"
              >
                Open full pack
                <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
              </TrackedOutboundLink>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-border/70 bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#fdba74] bg-gradient-to-r from-[#fff7ed] to-[#ffedd5] p-6 shadow-[0_8px_25px_rgba(251,146,60,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(251,146,60,0.3)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c2410c] text-white">
                  <CalendarDays className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c2410c]">Featured</p>
                  <h2 className="mt-0.5 font-serif text-xl font-semibold text-[#9a3412]">Last 5-Day Exam Plan</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate">
                    Your final strategy to maximise marks before the exam.
                  </p>
                </div>
              </div>
              <Link
                href="/resources/view/last-5-day-plan"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#9a3412]"
              >
                View Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ResourcesHub resources={safeResources} />
    </>
  );
}
