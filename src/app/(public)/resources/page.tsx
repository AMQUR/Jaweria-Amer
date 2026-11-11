import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { contact, ENROL_NOW_URL } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { getPublicResources } from "@/lib/public-cms";
import { ResourcesHub } from "@/components/resources-hub";
import { Paper1ChecklistBanner } from "@/components/paper1-checklist-banner";
import { ResourcesPageScroll } from "@/components/resources-page-scroll";
import { PageIntro } from "@/components/editorial/page-intro";
import { PointerField } from "@/components/editorial/pointer-field";
import { Arrow } from "@/components/editorial/arrow";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free hub: notes, topicals, yearlies, scripts, marking schemes, and MCQ drills for Cambridge O Level English (1123).",
  alternates: { canonical: "/resources" },
  ...socialMetadata({
    title: `Resources — ${siteConfig.name}`,
    description:
      "Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised for purposeful practice.",
    path: "/resources",
  }),
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResourcesPage() {
  const resources = (await getPublicResources()) ?? [];

  return (
    <>
      <ResourcesPageScroll />
      <PageIntro
        label="Learning hub"
        title="Resources"
        lead="Notes, topicals, yearlies, scripts, marking schemes, and MCQs — organised so you can practise with a clear path instead of a file dump."
      >
        <a href="#resource-hub" className="ed-link text-crimson">
          Browse the library
          <Arrow direction="down" />
        </a>
      </PageIntro>

      <section className="ed-paper border-t border-ink/10">
        <div className="ed-wrap flex flex-col gap-8 py-10 sm:py-14">
          {/* 1 — Batch readiness checklist + reward (the one interactive popup we keep) */}
          <Paper1ChecklistBanner />

          {/* 2 — YouTube and the guided programme, as two ruled doors */}
          <PointerField as="ul" className="ed-rows">
            <li>
              <TrackedOutboundLink
                href={contact.youtube}
                channel="youtube"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-row ed-row-compact"
              >
                <span className="ed-row-body">
                  <h2 className="ed-row-title">
                    English with Miss Jay on YouTube
                  </h2>
                </span>
                <span className="ed-row-meta">
                  <span>
                    Lesson-style explanations, exam thinking, and revision
                    support — built to complement the materials below.
                  </span>
                </span>
                <span className="ed-row-arrow" aria-hidden="true">
                  <Arrow direction="up-right" />
                </span>
              </TrackedOutboundLink>
            </li>
            <li>
              <TrackedOutboundLink
                href={ENROL_NOW_URL}
                channel="enrol"
                className="ed-row ed-row-compact"
              >
                <span className="ed-row-body">
                  <h2 className="ed-row-title">
                    Free resources help you practise. The live programme helps
                    you improve.
                  </h2>
                </span>
                <span className="ed-row-meta">
                  <span>
                    Enrol for checked work, personalised feedback, biweekly
                    tests, progress reports, and a complete study plan —
                    accountability that turns practice into marks.
                  </span>
                </span>
                <span className="ed-row-arrow" aria-hidden="true">
                  <Arrow />
                </span>
              </TrackedOutboundLink>
            </li>
          </PointerField>
        </div>
      </section>

      <Suspense
        fallback={<div className="min-h-[40vh] bg-cream" aria-hidden />}
      >
        <ResourcesHub resources={resources} />
      </Suspense>
    </>
  );
}
