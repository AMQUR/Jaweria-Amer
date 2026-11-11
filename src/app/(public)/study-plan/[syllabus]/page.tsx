import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { socialMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/editorial/page-intro";
import { SYLLABUSES, getSyllabus, isSyllabusKey } from "@/lib/exam/exam-dates";
import { getTimetable } from "@/lib/exam/timetable";
import { buildWeeks, getPlan } from "@/lib/exam/study-plan";
import { StudyPlanChecklist } from "@/components/exam/study-plan-checklist";
import { CountdownList } from "@/components/exam/countdown-list";
import { EXAM_SERIES } from "@/lib/exam/exam-dates";

export const dynamicParams = false;
export const revalidate = 120;
export function generateStaticParams() {
  return SYLLABUSES.map((s) => ({ syllabus: s.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ syllabus: string }> }): Promise<Metadata> {
  const { syllabus } = await params;
  if (!isSyllabusKey(syllabus)) return {};
  const s = getSyllabus(syllabus);
  const title = `${s.short} Free Study Plan`;
  const description = `A free monthly study plan for ${s.name} (${s.code}), from November 2026 to your June 2027 exam, with tick boxes that save in your browser.`;
  const path = `/study-plan/${syllabus}`;
  return { title, description, alternates: { canonical: path }, ...socialMetadata({ title, description, path }) };
}

export default async function StudyPlanPage({ params }: { params: Promise<{ syllabus: string }> }) {
  const { syllabus } = await params;
  if (!isSyllabusKey(syllabus)) notFound();
  const s = getSyllabus(syllabus);
  const { timetable } = await getTimetable();
  const papers = timetable[syllabus];
  const plan = getPlan(syllabus);
  return (
    <>
      <PageIntro label="Free study plan" title={s.short} size="md" lead={`${s.name}: November 2026 to your Cambridge ${EXAM_SERIES.label} papers.`} />
      <section className="ed-paper ed-margin pb-24">
        <div className="ed-wrap">
          <h2 className="ed-h3">Your paper dates</h2>
          <p className="mt-2 mb-4 font-semibold text-ink">{EXAM_SERIES.centreNote}</p>
          <CountdownList syllabus={syllabus} papers={papers} />
          <p className="mt-4 text-slate">
            <Link href="/exam-countdown" className="text-crimson underline underline-offset-4">Full exam countdown</Link>
          </p>
          <div className="mt-12">
            <StudyPlanChecklist syllabus={syllabus} weeks={buildWeeks(syllabus, papers)} papers={papers} approved={plan.approved} />
          </div>
        </div>
      </section>
    </>
  );
}
