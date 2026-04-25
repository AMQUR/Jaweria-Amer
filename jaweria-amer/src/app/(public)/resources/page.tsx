import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, PlayCircle, CalendarDays } from "lucide-react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact } from "@/lib/contact";
import { siteConfig, staticResources } from "@/lib/data";
import { getPublicResources } from "@/lib/public-cms";
import { ResourcesHub } from "@/components/resources-hub";
import { ChecklistBanner } from "@/components/checklist-banner";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free hub: notes, topicals, yearlies, scripts, marking schemes, and MCQ drills for Cambridge O Level English (1123).",
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

      <section className="border-b border-border/70 bg-white pb-14 pt-10 sm:pb-16 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="flex flex-col justify-between gap-10 rounded-2xl border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c] p-8 text-white shadow-[0_12px_35px_rgba(127,29,29,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(127,29,29,0.45)] sm:p-10 md:flex-row md:items-center md:gap-12 lg:p-12"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white sm:h-14 sm:w-14">
                <PlayCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60 sm:text-[13px]">
                Channel
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                English with Jaweria on YouTube
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                Lesson-style explanations, exam thinking, and revision support — built to complement
                the materials below.
              </p>
            </div>
            <div className="shrink-0 md:pt-2">
              <TrackedOutboundLink
                href={contact.youtube}
                channel="youtube"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#7f1d1d] shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-[#ffe4e6] md:inline-flex md:w-auto md:min-w-[220px]"
              >
                Open YouTube channel
                <ExternalLink className="h-[1.125rem] w-[1.125rem] shrink-0 opacity-90" aria-hidden />
              </TrackedOutboundLink>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-border/70 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <ChecklistBanner />
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-[#fdba74] bg-gradient-to-r from-[#fff7ed] to-[#ffedd5] p-6 shadow-[0_8px_25px_rgba(251,146,60,0.2)] transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(251,146,60,0.35)] motion-reduce:transition-shadow motion-reduce:hover:scale-100">
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/45 via-transparent to-[#fb923c]/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c2410c] text-white shadow-sm ring-1 ring-white/25">
                  <CalendarDays className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c2410c]">Featured</p>
                  <h2 className="mt-0.5 font-serif text-xl font-semibold text-[#9a3412]">
                    Last Minute P2 – Writing Revision Guide
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate">
                    Complete your final exam prep before Paper 2.
                  </p>
                </div>
              </div>
              <Link
                href="/resources/view/final-p2-checklist"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#9a3412] hover:shadow-md"
              >
                Open Revision Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[40vh] bg-cream" aria-hidden />}>
        <ResourcesHub resources={safeResources} />
      </Suspense>
    </>
  );
}
