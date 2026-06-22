"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { courses } from "@/lib/data";
import { CourseCard } from "@/components/course-card";
import { cn } from "@/lib/utils";
import { TrackedOutboundLink } from "@/components/analytics/tracked-links";
import { ENROL_NOW_URL } from "@/lib/contact";
import {
  listMarketingCourses,
  MARKETING_COURSE_FILTER_CHIPS,
  type MarketingCourseFilterValue,
} from "@/lib/course-offerings";

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState<MarketingCourseFilterValue>("all");

  const marketingCourses = listMarketingCourses(courses);

  const filtered =
    activeCategory === "all"
      ? marketingCourses
      : marketingCourses.filter((c) => c.category === activeCategory);

  return (
    <>
      <section className="bg-gradient-to-b from-crimson to-crimson-dark pb-14 pt-28 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs">
            Programmes
          </p>
          <h1 className="mb-4 max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem] lg:leading-snug">
            Course directory
          </h1>
          <p className="mb-7 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Guided live programmes for Cambridge O Level, IGCSE, and A Level English. Every course includes
            checked work, personalised feedback, biweekly tests, and progress reports — not just materials.
          </p>
          <TrackedOutboundLink
            href={ENROL_NOW_URL}
            channel="enrol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-crimson shadow-md transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            Enrol Now
            <ArrowRight className="h-4 w-4" />
          </TrackedOutboundLink>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Nudge band — free resources vs guided programme */}
          <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-crimson/15 bg-crimson/5 px-6 py-5 sm:mb-12 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-sm leading-relaxed text-slate sm:text-base">
              <span className="font-semibold text-ink">Want checked copies, personalised feedback, and progress reports?</span>{" "}
              Use the free resources to start, then join the guided batch for structure and accountability.
            </p>
            <TrackedOutboundLink
              href={ENROL_NOW_URL}
              channel="enrol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
            >
              Enrol Now
              <ArrowRight className="h-4 w-4" />
            </TrackedOutboundLink>
          </div>
          <div className="mb-12 flex flex-wrap gap-2 sm:mb-14">
            {MARKETING_COURSE_FILTER_CHIPS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  activeCategory === cat.value
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(112,20,20,0.2)]"
                    : "border-border/80 bg-white text-slate shadow-sm hover:border-border hover:bg-muted/40"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-sm text-slate">No courses found in this category.</p>
          )}
        </div>
      </section>
    </>
  );
}
