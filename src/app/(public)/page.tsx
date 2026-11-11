import type { Metadata } from "next";
import Link from "next/link";
import { listMarketingCourses } from "@/lib/course-offerings";
import { courses, siteConfig } from "@/lib/data";
import { getSettings } from "@/lib/admin/store";
import { defaultHomepageContent } from "@/lib/admin/defaults";
import { getHomepageContent } from "@/lib/public-homepage";
import {
  TrackedOutboundLink,
  TrackedWhatsAppLink,
} from "@/components/analytics/tracked-links";
import { ContactEmailLink } from "@/components/contact-email-link";
import {
  contact,
  whatsAppGroupUrl,
  ENROL_NOW_URL,
  COMMUNITY_WHATSAPP_URL,
} from "@/lib/contact";
import { socialMetadata } from "@/lib/seo";
import { isBatchAnnouncementActive } from "@/lib/public-experience";
import { LiveSessionHero } from "@/components/live-session-hero";
import {
  LessonsSection,
  ResourcesAndEvaluation,
  StudentExperience,
} from "@/components/public-experience/home-preview";
import { evaluationAvailable } from "@/lib/evaluation/server";
import { ResultsShowcase } from "@/components/results/results-showcase";
import { getMj26Headline, SESSION_LABEL } from "@/lib/results/public";
import { Arrow } from "@/components/editorial/arrow";
import { PointerField } from "@/components/editorial/pointer-field";
import { InteractiveCourseRow } from "@/components/editorial/interactive-course-row";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...socialMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
  }),
};

export const dynamic = "force-dynamic";

const TEACHING_PRINCIPLES = [
  {
    title: "Rubric-aligned",
    text: "Every exercise maps to CAIE marking criteria. No guesswork, no wasted effort.",
  },
  {
    title: "Examiner insights",
    text: "Feedback modelled on examiner reports. You learn what gains marks and what loses them.",
  },
  {
    title: "Calm mentorship",
    text: "Supportive, structured guidance that keeps confidence intact while raising standards.",
  },
];

export default async function HomePage() {
  const programmes = listMarketingCourses(courses);
  const featuredCourses = programmes.filter((c) => c.featured);
  const [settings, homepageContent] = await Promise.all([
    getSettings(),
    getHomepageContent(),
  ]);
  const stats = settings?.stats ?? [];
  const safeHomepageContent = homepageContent ?? defaultHomepageContent;
  const headline = getMj26Headline();

  return (
    <>
      <LiveSessionHero
        bannerImagePath={safeHomepageContent.bannerImagePath}
        heroContent={safeHomepageContent}
        announcementActive
        enrolmentOpen={isBatchAnnouncementActive()}
        programmes={programmes}
        proof={{
          pct: Math.round(headline.aOrAStarPct),
          aOrAStar: headline.aOrAStar,
          sharedResults: headline.sharedResults,
          session: SESSION_LABEL,
        }}
      />

      {/* M/J 2026 proof block — the results are the proof, so they sit straight after the hero */}
      <ResultsShowcase />

      {/* Who is Miss Jay — the teacher behind the results */}
      <section className="ed-paper">
        <div className="ed-wrap grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="ed-label">Your teacher</p>
            <h2 className="ed-h2 mt-5">Structure, not stress.</h2>
            <blockquote className="ed-quote mt-8 max-w-2xl text-[clamp(1.5rem,3vw,2.4rem)] text-ink">
              “My approach is simple: reduce confusion and give students a
              sense of control.”
            </blockquote>
            <p className="ed-lead mt-6">
              We don&apos;t do panic prep. We build repeatable exam thinking
              through a method that&apos;s rubric-led, feedback-rich, and
              designed around how Cambridge actually marks.
            </p>
            <Link href="/about" className="ed-link mt-6 text-crimson">
              Meet Miss Jay
              <Arrow />
            </Link>
          </div>
          <div className="lg:col-span-5 lg:pt-12">
            <ul className="border-t border-ink/15">
              {TEACHING_PRINCIPLES.map((item) => (
                <li key={item.title} className="border-b border-ink/15 py-5">
                  <h3 className="ed-h3">{item.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-slate">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
            {/* Stats — admin-editable figures; the A/A* stat is test-locked to the dataset */}
            {stats.length > 0 ? (
              <dl className="mt-8 grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <div key={`stat-${i}`} className="flex flex-col">
                    <dt className="order-2 mt-2 text-[0.8125rem] leading-snug text-slate">
                      {String(stat.label ?? "")}
                    </dt>
                    <dd className="ed-num text-[clamp(2rem,4vw,3rem)] text-crimson">
                      {String(stat.value ?? "")}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      {/* Programmes — the signature interactive rows */}
      <section className="ed-paper">
        <div className="ed-wrap py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className="ed-label">Programmes</p>
              <h2 className="ed-h2 mt-5">Choose your syllabus.</h2>
            </div>
            <Link href="/courses" className="ed-link text-crimson">
              View all courses
              <Arrow />
            </Link>
          </div>
          <PointerField as="ul" className="ed-rows mt-10">
            {featuredCourses.map((course) => (
              <InteractiveCourseRow key={course.id} course={course} />
            ))}
          </PointerField>
        </div>
      </section>

      {/* The method — a real sequence, so it is numbered */}
      <section className="border-y border-ink/10 bg-paper-deep">
        <div className="ed-wrap grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="ed-label">The method</p>
              <h2 className="ed-h2 mt-5">Your step‑by‑step roadmap.</h2>
              <p className="ed-lead mt-5">
                A clear, structured journey from diagnostic to exam day. Every
                step is designed to build skill, confidence, and control.
              </p>
            </div>
          </div>
          <ol className="border-t border-ink/15 lg:col-span-7">
            {siteConfig.roadmap.map((step) => (
              <li
                key={step.step}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 border-b border-ink/15 py-6 sm:grid-cols-[6rem_minmax(0,1fr)]"
              >
                <span
                  className="ed-num text-[clamp(2.2rem,5vw,3.75rem)] text-crimson"
                  aria-hidden
                >
                  {String(step.step).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="ed-h3">{step.title}</h3>
                  <p className="mt-1.5 max-w-lg leading-relaxed text-slate">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LessonsSection />

      <ResourcesAndEvaluation evaluationReady={evaluationAvailable()} />

      <StudentExperience />

      {/* How to get started */}
      <section className="ed-crimson">
        <PointerField className="ed-wrap grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <p className="ed-label">How to get started</p>
            <h2 className="ed-display mt-5 text-[clamp(2.4rem,7vw,5.5rem)]">
              Ready for structure, feedback &amp; real progress?
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[1.06rem] leading-relaxed text-paper/80">
              Free resources help you practise. The live programme helps you
              improve — with checked work, personalised feedback, biweekly
              tests, and progress reports. Enrol when you&apos;re ready, or
              book a short clarity call first. No pressure.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <TrackedOutboundLink
                href={ENROL_NOW_URL}
                channel="enrol"
                className="ed-btn ed-btn-paper ed-btn-lg"
                data-depth="magnet"
              >
                Enrol Now
                <Arrow />
              </TrackedOutboundLink>
              <TrackedWhatsAppLink
                href={whatsAppGroupUrl()}
                location="home_footer_cta"
                variant="group"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn ed-btn-ghost ed-btn-lg text-paper"
              >
                Book a call
                <Arrow direction="up-right" />
              </TrackedWhatsAppLink>
            </div>
            <p className="mt-5 text-[0.9rem] text-paper/70">
              Or write to{" "}
              <ContactEmailLink variant="onDark" className="font-medium" />
            </p>
          </div>
        </PointerField>

        {/* Stay connected — secondary to the enrolment journey */}
        <div className="border-t border-paper/20">
          <div className="ed-wrap flex flex-col gap-x-10 gap-y-2 py-6 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="mr-auto max-w-md text-[0.9rem] text-paper/75">
              Stay connected: lessons, updates, and a student community —
              useful alongside the programme, not instead of it.
            </p>
            <TrackedOutboundLink
              href={contact.youtube}
              channel="youtube"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-link text-paper"
            >
              YouTube
              <Arrow direction="up-right" />
            </TrackedOutboundLink>
            <TrackedOutboundLink
              href={COMMUNITY_WHATSAPP_URL}
              channel="community"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-link text-paper"
            >
              Join Community
              <Arrow direction="up-right" />
            </TrackedOutboundLink>
            <TrackedOutboundLink
              href={contact.instagram}
              channel="instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-link text-paper"
            >
              Instagram
              <Arrow direction="up-right" />
            </TrackedOutboundLink>
          </div>
        </div>
      </section>
    </>
  );
}
