import type { Metadata } from "next";
import { Suspense } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { getPublicResources } from "@/lib/public-cms";
import { ResourcesHub } from "@/components/resources-hub";
import { ChecklistBanner } from "@/components/checklist-banner";
import { FileVaultCard } from "@/components/file-vault-card";
import { RevisionGuideCard } from "@/components/revision-guide-card";
import { MarathonBanner } from "@/components/marathon-banner";

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
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          {/* 1 — YouTube */}
          <div
            className="group flex flex-col justify-between gap-8 rounded-2xl border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c] p-8 shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl sm:p-10 md:flex-row md:items-center md:gap-12"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:scale-110">
                <PlayCircle className="h-7 w-7" aria-hidden />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Channel
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                English with Jaweria on YouTube
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
                Lesson-style explanations, exam thinking, and revision support — built to complement
                the materials below.
              </p>
            </div>
            <div className="shrink-0">
              <TrackedOutboundLink
                href={contact.youtube}
                channel="youtube"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 text-base font-medium text-[#7f1d1d] transition-all duration-200 hover:bg-[#ffe4e6] hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
              >
                Open YouTube channel
                <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </TrackedOutboundLink>
            </div>
          </div>

          {/* 2 — File Vault (Google Drive) */}
          <FileVaultCard />

          {/* 3 — Interactive Checklist */}
          <ChecklistBanner />

          {/* 4 — Last Minute Revision Guide (PDF) */}
          <RevisionGuideCard />
        </div>
      </section>

      <section className="border-b border-border/70 bg-white pb-8 pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MarathonBanner />
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[40vh] bg-cream" aria-hidden />}>
        <ResourcesHub resources={resources} />
      </Suspense>
    </>
  );
}
