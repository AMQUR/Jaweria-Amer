import { socialMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { courses } from "@/lib/data";
import { getPublicCoursePriceLabel } from "@/lib/pricing-display";
import { isCourseCategoryOffered, listMarketingCourses } from "@/lib/course-offerings";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { ContactEmailLink } from "@/components/contact-email-link";
import { whatsAppGroupUrl } from "@/lib/contact";
import { Arrow } from "@/components/editorial/arrow";
import { PageIntro } from "@/components/editorial/page-intro";
import {
  courseSyllabusCodes,
  SyllabusCode,
} from "@/components/editorial/interactive-course-row";
import { RegistrationLink } from "@/components/public-experience/registration-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    ...socialMetadata({
      title: course.title,
      description: course.description,
      path: `/courses/${course.id}`,
    }),
    alternates: {
      canonical: `/courses/${course.id}`,
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);
  if (!course || !isCourseCategoryOffered(course.category)) notFound();

  const codes = courseSyllabusCodes(course);

  return (
    <>
      <PageIntro
        size="md"
        label={
          <Link href="/courses" className="inline-flex items-center gap-2 hover:underline">
            <Arrow direction="left" />
            All courses
          </Link>
        }
        title={course.title}
        lead={course.description}
        aside={
          <div className="lg:text-right">
            <p className="ed-num text-[clamp(4.5rem,13vw,10rem)] text-crimson" aria-hidden="true">
              <SyllabusCode codes={codes} />
            </p>
            <p className="mt-2 text-[0.95rem] font-semibold text-ink">
              {course.categoryLabel} · {course.subtitle}
            </p>
          </div>
        }
      >
        <dl className="flex flex-wrap gap-x-10 gap-y-3 border-t border-ink/15 pt-5">
          <div>
            <dt className="text-[0.8125rem] text-slate">Duration</dt>
            <dd className="font-semibold text-ink">{course.duration}</dd>
          </div>
          <div>
            <dt className="text-[0.8125rem] text-slate">Schedule</dt>
            <dd className="font-semibold text-ink">{course.schedule}</dd>
          </div>
          <div>
            <dt className="text-[0.8125rem] text-slate">Syllabus</dt>
            <dd className="font-semibold tabular-nums text-ink">Cambridge {codes.join(" / ")}</dd>
          </div>
        </dl>
      </PageIntro>

      <div className="ed-paper border-t border-ink/10">
        <div className="ed-wrap grid gap-14 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-16 lg:col-span-8">
            <section aria-labelledby="outcomes-heading">
              <h2 id="outcomes-heading" className="ed-h2">What you will learn</h2>
              <ul className="mt-8 border-t border-ink/15">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-4 border-b border-ink/15 py-4">
                    <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0 text-crimson" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5 9.5 18 20 6.5" />
                    </svg>
                    <span className="text-[1.06rem] leading-relaxed text-ink-muted">{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="coverage-heading">
              <h2 id="coverage-heading" className="ed-h2">Syllabus coverage</h2>
              <ul className="mt-8 grid border-t border-ink/15 sm:grid-cols-2 sm:gap-x-10">
                {course.syllabus.map((item) => (
                  <li key={item} className="border-b border-ink/15 py-3.5 font-semibold text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="curriculum-heading">
              <h2 id="curriculum-heading" className="ed-h2">Curriculum</h2>
              <Accordion className="mt-8 border-t border-ink/15">
                {course.curriculum.map((module, i) => (
                  <AccordionItem
                    key={i}
                    value={`module-${i}`}
                    className="border-b border-ink/15"
                  >
                    <AccordionTrigger className="min-h-14 py-4 text-left hover:no-underline">
                      <span className="flex items-baseline gap-5">
                        <span className="ed-num w-9 shrink-0 text-[1.6rem] text-crimson" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="ed-h3">{module.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <ul className="space-y-2 pl-14">
                        {module.topics.map((topic) => (
                          <li
                            key={topic}
                            className="flex items-start gap-3 leading-relaxed text-slate"
                          >
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-crimson" aria-hidden="true" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          <aside className="lg:col-span-4" aria-label="Enquire about this course">
            <div className="sticky top-24 border-t-2 border-crimson pt-6">
              <h2 className="ed-h3">Enquire about {course.categoryLabel} {codes.join(" / ")}</h2>
              <p className="mt-3 leading-relaxed text-slate">
                Tell us you&apos;re interested and we&apos;ll follow up with batch
                details. This is an enquiry, not a payment or a confirmed seat.
              </p>
              <RegistrationLink surface="course_detail" className="ed-btn ed-btn-lg mt-6 w-full">
                Join the Next Batch
                <Arrow />
              </RegistrationLink>
              <TrackedWhatsAppLink
                href={whatsAppGroupUrl()}
                location="course_detail"
                variant="group"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn ed-btn-ghost mt-3 w-full text-ink"
              >
                Text us
                <Arrow direction="up-right" />
              </TrackedWhatsAppLink>

              <div className="mt-8 border-t border-ink/15 pt-5">
                <p className="font-semibold text-ink">
                  {getPublicCoursePriceLabel(course)}
                </p>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-slate">
                  Programme fee is confirmed after a short conversation about your goals and timeline.
                </p>
              </div>
              <p className="mt-5 text-[0.875rem] leading-relaxed text-slate">
                Not sure if this is the right fit? Book a free 15-minute call.
                We&apos;ll assess your level and recommend a plan.
              </p>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-slate">
                Email: <ContactEmailLink className="font-medium" />
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
