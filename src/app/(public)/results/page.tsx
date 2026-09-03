import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResultsArchive } from "@/components/results/results-archive";
import { ResultsMethodology } from "@/components/results/results-methodology";
import { ResultsShowcase } from "@/components/results/results-showcase";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { ENROL_NOW_URL } from "@/lib/contact";
import { getMj26Headline, getMj26Results } from "@/lib/results/public";

const h = getMj26Headline();

export const metadata: Metadata = {
  title: "M/J 2026 Results",
  description: `${Math.round(h.aOrAStarPct)}% of ${h.sharedResults} shared May/June 2026 Cambridge English results were A or A* — ${h.aStar} A* and ${h.a} A. Every result shared with the student's permission.`,
  alternates: { canonical: "/results" },
  openGraph: {
    title: "M/J 2026 Results — Jaweria Amer",
    description: `${h.aOrAStar} of ${h.sharedResults} shared May/June 2026 result records were A or A*.`,
    type: "website",
    url: "/results",
  },
};

export default function ResultsPage() {
  const { records } = getMj26Results();
  return (
    <div className="results-ink">
      {/* Offset the fixed navbar so the dark block starts at the top. */}
      <div className="h-16 sm:h-[4.25rem]" aria-hidden="true" />
      <ResultsShowcase titleTag="h1" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section aria-labelledby="archive-heading" className="border-t pt-12" style={{ borderColor: "var(--results-line)" }}>
          <p className="results-eyebrow">Evidence archive</p>
          <h2 id="archive-heading" className="mt-2 font-serif text-[1.75rem] font-semibold tracking-tight">Every shared result, one by one</h2>
          <p className="mt-2 max-w-2xl text-[14.5px]" style={{ color: "var(--results-mute)" }}>
            Filter by grade, then select any result to see its archive card. Nothing here moves.
          </p>
          <div className="mt-8">
            <ResultsArchive records={records} />
          </div>
        </section>

        <div className="my-16 border-t" style={{ borderColor: "var(--results-line)" }} />
        <ResultsMethodology />

        <div
          className="mt-16 flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          style={{ background: "var(--results-card)", border: "1px solid var(--results-line)" }}
        >
          <div>
            <p className="results-eyebrow">Next series</p>
            <p className="mt-1 font-serif text-[1.25rem] font-semibold tracking-tight">Preparing for October/November 2026 or May/June 2027?</p>
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--results-mute)" }}>Structured lessons, checked work and feedback modelled on how Cambridge marks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackedOutboundLink
              href={ENROL_NOW_URL}
              channel="enrol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2"
              style={{ background: "var(--results-pink)", color: "var(--results-bg)" }}
            >
              Enrol Now
              <ArrowRight className="size-4" aria-hidden="true" />
            </TrackedOutboundLink>
            <Link
              href="/courses"
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2"
              style={{ border: "1px solid var(--results-line)", color: "var(--results-cream)" }}
            >
              See programmes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
