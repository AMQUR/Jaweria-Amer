"use client";

import { useState } from "react";
import { courses } from "@/lib/data";
import { CourseCard } from "@/components/course-card";
import { cn } from "@/lib/utils";
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
          <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Structured programmes for Cambridge O Level, Literature, and Creative Writing. Each course is
            rubric-aligned and feedback-driven.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
