import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, ExternalLink, PlayCircle } from "lucide-react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact, ENROL_NOW_URL } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { getPublicResources } from "@/lib/public-cms";
import { ResourcesHub } from "@/components/resources-hub";
import { Paper1ChecklistBanner } from "@/components/paper1-checklist-banner";
import { ResourcesPageScroll } from "@/components/resources-page-scroll";
import { CARD_BASE, CARD_BUTTON, CARD_CONTENT, CARD_HOVER } from "@/components/resource-card-system";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free hub: notes, topicals, yearlies, scripts, marking schemes, and MCQ drills for Cambridge O Level English (1123).",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: `Resources — ${siteConfig.name}`,
    description:
      "Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised for purposeful practice.",
    type: "website",
    url: "/resources",
  },
  twitter: {
    card: "summary_large_image",
    title: `Resources — ${siteConfig.name}`,
    description:
      "Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised for purposeful practice.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResourcesPage() {
  const resources = (await getPublicResources()) ?? [];

  return (
    <>
      <ResourcesPageScroll />
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
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
          {/* 1 — YouTube */}
          <div
            className={`${CARD_BASE} ${CARD_HOVER} group flex-col gap-5 border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c] text-white sm:flex-row sm:gap-6`}
          >
            <div className="min-w-0 flex-1 self-stretch sm:self-auto">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:scale-105">
                <PlayCircle className="h-6 w-6" aria-hidden />
              </div>
              <div className={CARD_CONTENT}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Channel
                </p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  English with Jaweria on YouTube
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                  Lesson-style explanations, exam thinking, and revision support — built to complement
                  the materials below.
                </p>
              </div>
            </div>
            <TrackedOutboundLink
              href={contact.youtube}
              channel="youtube"
              target="_blank"
              rel="noopener noreferrer"
              className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-white text-[#7f1d1d] hover:bg-[#ffe4e6] sm:w-auto`}
            >
              Open YouTube channel
              <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            </TrackedOutboundLink>
          </div>

          {/* 2 — Batch readiness checklist + Pokémon reward (the one interactive popup we keep) */}
          <Paper1ChecklistBanner />

          {/* 3 — Enrol nudge: free resources → guided programme */}
          <div
            className={`${CARD_BASE} ${CARD_HOVER} group flex-col gap-5 border border-crimson/15 bg-crimson/5 sm:flex-row sm:gap-6`}
          >
            <div className="min-w-0 flex-1 self-stretch sm:self-auto">
              <div className={CARD_CONTENT}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-crimson/70">
                  Go further
                </p>
                <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                  Free resources help you practise. The live programme helps you improve.
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-slate sm:text-base">
                  Enrol for checked work, personalised feedback, biweekly tests, progress reports, and a
                  complete study plan — accountability that turns practice into marks.
                </p>
              </div>
            </div>
            <TrackedOutboundLink
              href={ENROL_NOW_URL}
              channel="enrol"
              target="_blank"
              rel="noopener noreferrer"
              className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto`}
            >
              Enrol Now
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </TrackedOutboundLink>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[40vh] bg-cream" aria-hidden />}>
        <ResourcesHub resources={resources} />
      </Suspense>
    </>
  );
}
