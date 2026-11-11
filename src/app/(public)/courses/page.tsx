"use client";

import { useState } from "react";
import Link from "next/link";
import { courses } from "@/lib/data";
import { cn } from "@/lib/utils";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { ENROL_NOW_URL } from "@/lib/contact";
import {
  listMarketingCourses,
  MARKETING_COURSE_FILTER_CHIPS,
  type MarketingCourseFilterValue,
} from "@/lib/course-offerings";
import { PageIntro } from "@/components/editorial/page-intro";
import { PointerField } from "@/components/editorial/pointer-field";
import { InteractiveCourseRow } from "@/components/editorial/interactive-course-row";
import { Arrow } from "@/components/editorial/arrow";

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] =
    useState<MarketingCourseFilterValue>("all");

  const marketingCourses = listMarketingCourses(courses);

  const filtered =
    activeCategory === "all"
      ? marketingCourses
      : marketingCourses.filter((c) => c.category === activeCategory);

  return (
    <>
      <PageIntro
        label="Programmes"
        title="Course directory"
        lead="Guided live programmes for Cambridge O Level, IGCSE, and A Level English. Every course includes checked work, personalised feedback, biweekly tests, and progress reports — not just materials."
      >
        <TrackedOutboundLink
          href={ENROL_NOW_URL}
          channel="enrol"
          className="ed-btn ed-btn-lg"
        >
          Enrol Now
          <Arrow />
        </TrackedOutboundLink>
      </PageIntro>

      <section className="ed-paper border-t border-ink/10">
        <div className="ed-wrap pb-16 pt-10 sm:pb-24 sm:pt-14">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter programmes by level"
          >
            {MARKETING_COURSE_FILTER_CHIPS.map((cat) => {
              const active = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "min-h-11 rounded-full border px-5 text-[0.95rem] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/25 bg-transparent text-ink hover:border-ink",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-[0.875rem] text-slate" aria-live="polite">
            Showing {filtered.length} of {marketingCourses.length} programmes.
          </p>

          <PointerField as="ul" className="ed-rows mt-8">
            {filtered.map((course) => (
              <InteractiveCourseRow
                key={course.id}
                course={course}
                headingLevel="h2"
              />
            ))}
          </PointerField>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-slate">
              No courses found in this category.
            </p>
          )}

          {/* Free resources vs guided programme */}
          <div className="mt-16 grid gap-6 border-t border-ink/15 pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
            <p className="max-w-2xl text-[1.06rem] leading-relaxed text-slate">
              <span className="font-semibold text-ink">
                Want checked copies, personalised feedback, and progress
                reports?
              </span>{" "}
              Use the free resources to start, then join the guided batch for
              structure and accountability.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <TrackedOutboundLink
                href={ENROL_NOW_URL}
                channel="enrol"
                className="ed-btn"
              >
                Enrol Now
                <Arrow />
              </TrackedOutboundLink>
              <Link href="/resources" className="ed-link text-crimson">
                Browse free resources
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
