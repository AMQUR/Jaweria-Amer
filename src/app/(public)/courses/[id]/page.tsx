import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { courses } from "@/lib/data";
import { getPublicCoursePriceLabel } from "@/lib/pricing-display";
import { isCourseCategoryOffered, listMarketingCourses } from "@/lib/course-offerings";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { ContactEmailLink } from "@/components/contact-email-link";
import { whatsAppGroupUrl } from "@/lib/contact";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const categoryColors: Record<string, string> = {
  "o-level": "border-crimson/15 bg-crimson/8 text-crimson",
  "a-level": "border-rose/20 bg-rose/10 text-rose-dark",
  literature: "border-border bg-brand-soft/80 text-brand",
  "creative-writing": "border-border bg-muted text-ink-muted",
};

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  return listMarketingCourses(courses).map((course) => ({ id: course.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);
  if (!course || !isCourseCategoryOffered(course.category)) return {};
  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
      url: `/courses/${course.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.description,
    },
    alternates: {
      canonical: `/courses/${course.id}`,
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);
  if (!course || !isCourseCategoryOffered(course.category)) notFound();

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-crimson to-crimson-dark pb-14 pt-28 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Link>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={categoryColors[course.category] ?? "border-border"}>
              {course.categoryLabel}
            </Badge>
          </div>
          <h1 className="mb-2 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
            {course.title}
          </h1>
          <p className="mb-5 text-sm text-white/55">{course.subtitle}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">{course.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="space-y-14 lg:col-span-2">
            <div>
              <h2 className="mb-5 font-serif text-xl font-semibold text-ink sm:text-2xl">What you will learn</h2>
              <div className="space-y-3.5">
                {course.outcomes.map((outcome) => (
                  <div key={outcome} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                    <span className="text-slate text-sm leading-relaxed">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-5 font-serif text-xl font-semibold text-ink sm:text-2xl">Syllabus coverage</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {course.syllabus.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-border/70 bg-cream px-4 py-3.5 text-sm text-ink"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-5 font-serif text-xl font-semibold text-ink sm:text-2xl">Curriculum</h2>
              <Accordion className="space-y-3">
                {course.curriculum.map((module, i) => (
                  <AccordionItem
                    key={i}
                    value={`module-${i}`}
                    className="overflow-hidden rounded-xl border border-border/70 bg-white px-5 shadow-[0_1px_2px_rgba(34,16,18,0.04)]"
                  >
                    <AccordionTrigger className="py-4 text-sm font-medium text-ink hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-brand">
                          {i + 1}
                        </span>
                        {module.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <ul className="space-y-2 pl-11">
                        {module.topics.map((topic) => (
                          <li
                            key={topic}
                            className="flex items-start gap-2 text-sm text-slate"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div>
            <div className="sticky top-24 space-y-6 rounded-xl border border-border/70 bg-white p-7 shadow-[0_1px_3px_rgba(34,16,18,0.05)]">
              <div>
                <p className="font-serif text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {getPublicCoursePriceLabel(course)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Programme fee is confirmed after a short conversation about your goals and timeline.
                </p>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <TrackedWhatsAppLink
                  href={whatsAppGroupUrl()}
                  location="course_detail"
                  variant="group"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgba(34,16,18,0.08)] transition-all hover:bg-brand-accent hover:shadow-[0_4px_14px_rgba(112,20,20,0.15)]"
                >
                  Text us
                  <ArrowRight className="h-4 w-4" />
                </TrackedWhatsAppLink>
              </div>

              <div className="space-y-3 border-t border-border pt-6 text-sm text-slate">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                  {course.schedule}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Not sure if this is the right fit? Book a free 15-minute call.
                We&apos;ll assess your level and recommend a plan.
              </p>
              <p className="text-xs leading-relaxed text-slate">
                Email: <ContactEmailLink className="text-xs font-medium" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
